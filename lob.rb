require 'sinatra'
require "ably"

client = Ably::Rest.new(key: '1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_')

get '/' do
  erb :index
end

post '/new-flight' do
  token = client.auth.create_token_request(ttl: 3600)
  redirect "/test/flyer\#1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_"
end

post '/join' do
  channel = request.POST["channel"]
  redirect "/#{channel}/tracker\#1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_"
end

get '/:channel_name/flyer' do
  erb :flyer, locals: {channel_name: params["channel_name"]}
end

get '/:channel_name/tracker' do
  erb :tracker, locals: {channel_name: params["channel_name"]}
end
