require "sinatra/base"
require "sinatra/cookies"
require "sinatra/content_for"

require "ably"

require_relative './lib/leaderboard'

class LobApp < Sinatra::Base
  helpers Sinatra::Cookies
  helpers Sinatra::ContentFor

  # Avoid ambiguous characters and letters
  # 31 characters ** 5 = 28m options, never goint to have a clash in reality
  LOB_CODE_PERMITTED_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.split("")

  set :public_folder, 'public'
  set(:cookie_options) do
    { :expires => Time.now + 3600*24 }
  end

  get '/' do
    erb :index
  end

  get '/about' do
    erb :about
  end

  get '/why-stream' do
    erb :"why-stream"
  end

  get '/leaderboard' do
    erb :leaderboard, locals: {leaderboard: Leaderboard.best_today, past: '24 hrs'}
  end

  get '/leaderboard/week' do
    erb :leaderboard, locals: {leaderboard: Leaderboard.best_this_week, past: '7 days'}
  end

  get '/leaderboard/month' do
    erb :leaderboard, locals: {leaderboard: Leaderboard.best_this_month, past: '30 days'}
  end

  get '/new-flight' do
    channel_name ||= cookies[:channel_name] || create_channel_name
    redirect "/flyer/#{channel_name}"
  end

  get '/flyer/:channel_name' do
    channel_name = params[:channel_name].strip
    cookies['channel_name'] = channel_name
    erb :flyer, locals: { channel_name: channel_name }
  end

  get '/flyer/:channel_name/token' do
    channel_name = params[:channel_name].upcase.strip
    if !channel_name
      status 400
      'Oops, that is not a valid channel name'
    else
      content_type :json
      capability = {
        '*' => ['subscribe', 'history'],
        channel_name => ['subscribe', 'publish', 'history', 'presence'],
        "flights:#{channel_name}" => ['subscribe', 'publish', 'history'],
        "broadcast:channel" => ['subscribe', 'publish', 'history'] # channel name replicated in config.js
      }
      client.auth.create_token_request(client_id: channel_name, capability: capability).to_json
    end
  end

  get '/track-flight' do
    channel_name = (request.POST["channel-name"] || '').upcase
    if (channel_name.strip == '')
      status 400
      'Oops, that is not a valid channel name'
    else
      redirect "/track/#{channel_name}"
    end
  end

  get '/track/:channel_name' do
    channel_name = params[:channel_name].upcase.strip
    erb :tracker, locals: { channel_name: channel_name }
  end

  get '/token' do
    content_type :json
    capability = { '*' => ['subscribe', 'history'] }
    client.auth.create_token_request(capability: capability).to_json
  end

  post '/submit-flight' do
    begin
      username = request.POST['nickname'];
      max_altitude = request.POST['max-altitude']; # m
      max_flight_time = request.POST['max-flight-time']; # seconds
      device = request.POST['device'];

      flight = Flight.new(
        username: username,
        max_altitude: max_altitude,
        max_flight_time: max_flight_time,
        device: device
      )

      Leaderboard.submit_flight(flight)
      content_type :json
      { message: "Submitted successfully" }.to_json
    rescue ArgumentError => err
      status 400
      content_type :json
      { error: true, message: err.message }.to_json
    end
  end

  def client
    @client ||= Ably::Rest.new(key: ENV.fetch("ABLY_API_KEY"))
  end

  def create_channel_name
    5.times.map do
      LOB_CODE_PERMITTED_CHARS.sample
    end.join()
  end
end
