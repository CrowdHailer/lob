require "sinatra/base"

class LobApp < Sinatra::Base
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

end
