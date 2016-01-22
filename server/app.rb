require "sinatra/base"
require "sinatra/cookies"

require "ably"

class LobApp < Sinatra::Base
  helpers Sinatra::Cookies

  set :public_folder, 'public'

  get '/' do
    erb :index
  end

  get '/about' do
    erb :about
  end

  History = []
  get '/leaderboard' do
    erb :leaderboard, locals: {flights: History}
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

  def client
    @client ||= Ably::Rest.new(key: ENV.fetch("ABLY_API_KEY"))
  end

  def create_channel_name
    (1...(36 ** 4)).to_a.sample.to_s(36).upcase
  end
end
