require 'sinatra'

get '/' do
  erb :index
end

get '/:channel_name/flyer' do
  erb :flyer, locals: {channel_name: params["channel_name"]}
end

get '/:channel_name/tracker' do
  erb :tracker, locals: {channel_name: params["channel_name"]}
end
