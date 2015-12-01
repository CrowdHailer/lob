require 'sinatra'
require "ably"

client = Ably::Rest.new(key: '1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_')
History = [["Peter", "2", "12"]];

get '/' do
  erb :index
end

post '/new-flight' do
  token = client.auth.request_token.token
  channel = (1...(36 ** 4)).to_a.sample.to_s(36).upcase
  redirect "/#{channel}/flyer\##{token}"
end

post '/join' do
  channel = request.POST["channel"].upcase
  redirect "/#{channel}/tracker\#1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_"
end

get '/:channel_name/flyer' do
  erb :flyer, locals: {channel_name: params["channel_name"]}
end

get '/:channel_name/tracker' do
  erb :tracker, locals: {channel_name: params["channel_name"]}
end

post '/submit' do
  flight_time = request.POST['flight-time'];
  name = request.POST['name'];
  max_altitude = request.POST['max-altitude'];
  # TODO validate names/times
  History << [name, flight_time, max_altitude]
  History = History.sort_by { |_, _ , m| m.to_i * -1 }
  erb :submission
end

get '/leaderboard' do
  erb :leaderboard, locals: {flights: History}
end
