require "sinatra/base"

class LobApp < Sinatra::Base
  set :public_folder, 'public'
  get '/' do
    erb :index
  end

end
