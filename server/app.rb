require "sinatra/base"
require "sinatra/cookies"
require "sinatra/content_for"

require "ably"

require_relative './lib/leaderboard'

class LobApp < Sinatra::Base
  helpers Sinatra::Cookies
  helpers Sinatra::ContentFor

  set :public_folder, 'public'

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
    channel_name = cookies[:channel_name] ||= create_channel_name
    redirect "/flyer?channel-name=#{channel_name}"
  end

  get '/flyer' do
    channel_name = request.GET["channel-name"]
    erb :flyer
  end

  get '/flyer/:channel_name/token' do
    channel_name = params[:channel_name].upcase
    if !channel_name
      status 400
      'Invalid channel name'
    else
      content_type :json
      capability = { '*' => ['subscribe', 'history'], channel_name => ['subscribe', 'publish', 'history', 'presence'] }
      client.auth.create_token_request(client_id: channel_name, capability: capability).to_json
    end
  end

  post '/track-flight' do
    channel_name = request.POST["channel-name"].upcase
    redirect "/tracker?channel-name=#{channel_name}"
  end

  get '/track/:channel_name' do
    channel_name = params[:channel_name].upcase
    redirect "/tracker?channel-name=#{channel_name}"
  end

  get '/token' do
    content_type :json
    capability = { '*' => ['subscribe', 'history'] }
    client.auth.create_token_request(capability: capability).to_json
  end

  get '/tracker' do
    erb :tracker
  end

  post '/submit-flight' do
    begin
      username = request.POST['username'];
      max_altitude = request.POST['max-altitude']; # m
      flight = Flight.new(username: username, max_altitude: max_altitude)
      Leaderboard.submit_flight(flight)
      erb :submission
    rescue ArgumentError => err
      status 400
      erb :failed_submission, :locals => {message: err.message}
    end
  end

  def client
    @client ||= Ably::Rest.new(key: ENV.fetch("ABLY_API_KEY"))
  end

  def create_channel_name
    ((36 ** 3)...(36 ** 4 - 1)).to_a.sample.to_s(36).upcase
  end
end
