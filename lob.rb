require 'sinatra'
require "sinatra/cookies"

require "ably"

client = Ably::Rest.new(key: ENV.fetch("ABLY_API_KEY"))
History = [["Peter", "2", "12"]];

def create_channel_name
  (1...(36 ** 4)).to_a.sample.to_s(36).upcase
end
module MyHelpers
  def base_url
    @base_url ||= "#{request.env['rack.url_scheme']}://#{request.env['HTTP_HOST']}"
  end
end

helpers MyHelpers

get '/' do
  erb :index
end

post '/new-flight' do
  token = client.auth.request_token.token
  channel_name = cookies[:channel_name] ||= create_channel_name
  redirect "/flyer?channel-name=#{channel_name}&token=#{token}"
end

post '/join' do
  channel_name = request.POST["channel-name"].upcase
  token = client.auth.request_token.token
  redirect "/tracker?channel-name=#{channel_name}&token=#{token}"
end

get '/track/:channel' do
  # TODO change sent
  channel_name = params[:channel].upcase
  token = client.auth.request_token.token
  redirect "/tracker?channel-name=#{channel_name}&token=#{token}"
end

get '/flyer' do
  channel = request.GET["channel"]
  twitter_link = "https://twitter.com/home?status=Watch%20my%20awesome%20#{base_url}/track/#{channel}"
  erb :flyer, locals: {twitter_link: twitter_link}
end

get '/tracker' do
  erb :tracker
end

post '/submit' do
  flight_time = request.POST['flight-time'];
  name = request.POST['name'];
  max_altitude = request.POST['max-altitude'];
  # TODO validate names/times
  History << [name, flight_time, max_altitude]
  History = History.sort_by { |_, _ , m| m.to_f * -1 }
  erb :submission
end

get '/leaderboard' do
  erb :leaderboard, locals: {flights: History}
end

get '/about' do
  erb :about
end
