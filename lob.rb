require 'sinatra'

get '/' do
  erb :index
end

post '/new-flight' do
  redirect "/test/flyer\#1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_"
end

post '/join' do
  channel = request.POST["channel"]
  if channel == ""
    channel = "default"
  end
  if request.POST["flyer"]
    redirect "/#{channel}/flyer"
  else
    redirect "/#{channel}/tracker"
  end
end

get '/:channel_name/flyer' do
  erb :flyer, locals: {channel_name: params["channel_name"]}
end

get '/:channel_name/tracker' do
  erb :tracker, locals: {channel_name: params["channel_name"]}
end
