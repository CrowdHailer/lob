require "sinatra/base"
require "sinatra/cookies"

require "ably"

require_relative './lib/leaderboard'

class LobApp < Sinatra::Base
  helpers Sinatra::Cookies

  set :public_folder, 'public'

  get '/' do
    erb :index
  end

  get '/about' do
    erb :about
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

  post '/new-flight' do
    token = client.auth.request_token.token
    channel_name = cookies[:channel_name] ||= create_channel_name
    redirect "/flyer?channel-name=#{channel_name}&token=#{token}"
  end

  get '/flyer' do
    channel_name = request.GET["channel-name"]
    twitter_link = "https://twitter.com/home?status=I'm%20lobbing%20my%20phone%20with%20http%3A//lob.workshop14.io/.%20Track%20my%20flight%20http%3A//lob.workshop14.io/track/#{channel_name}%20%23giveitalob"
    erb :flyer, locals: {twitter_link: twitter_link}
  end

  post '/track-flight' do
    channel_name = request.POST["channel-name"].upcase
    token = client.auth.request_token.token
    redirect "/tracker?channel-name=#{channel_name}&token=#{token}"
  end

  get '/track/:channel_name' do
    channel_name = params[:channel_name].upcase
    token = client.auth.request_token.token
    redirect "/tracker?channel-name=#{channel_name}&token=#{token}"
  end

  # post /track-flight is for use from form on index page
  # get /tracker/:channel_name is for links from twitter etc
  # Could be better ways to combine these
  # All get /tracker/:channel-name?token=<token> redirect if token not present

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
