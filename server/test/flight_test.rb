require_relative './test_config'

require_relative '../lib/flight'

class FlightTest < MiniTest::Test
  def run(*args, &block)
    Sequel::Model.db.transaction(:rollback=>:always, :auto_savepoint=>true){super}
  end

  def test_valid_flight_has_username_and_max_altitude
    flight = Flight.new(username: 'bob', max_altitude: 25)
    assert_equal flight.username, 'bob'
    assert_equal flight.max_altitude, 25
  end
end
