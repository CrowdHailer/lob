require_relative './test_config'

require_relative '../app'

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
