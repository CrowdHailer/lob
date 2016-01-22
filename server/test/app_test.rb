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

  def test_the_about_page_is_available
    get '/about'
    assert last_response.ok?
  end

  def test_the_leaderboard_page_is_available
    get '/leaderboard'
    assert last_response.ok?
  end

  def test_posting_new_flight_redirects_with_token_and_channel
    post '/new-flight'
    assert_match(/flyer\?channel-name=[A-Z0-9]{4}&token=/, last_response.location)
  end

  def test_page_for_new_flyer_is_available
    # DEBT should check for channel name and token
    get '/flyer'
    assert last_response.ok?
  end
end
