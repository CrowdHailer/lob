require_relative './test_config'

require "sinatra/base"
class LobApp < Sinatra::Base
  get '/' do
    'TODO return index page'
  end

end

class AppTest < MiniTest::Test
  include Rack::Test::Methods
  def app
    LobApp
  end

  def test_the_index_page_is_available
    get '/'
    assert last_response.ok?
  end
end
