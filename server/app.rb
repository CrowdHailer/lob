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

  def client
    @client ||= Ably::Rest.new(key: ENV.fetch("ABLY_API_KEY"))
  end

  def create_channel_name
    (1...(36 ** 4)).to_a.sample.to_s(36).upcase
  end
end
