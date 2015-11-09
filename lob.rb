require 'sinatra'

get '/' do
  erb :index
end

get '/flyer' do
  erb :flyer
end

get '/tracker' do
  erb :tracker
end
