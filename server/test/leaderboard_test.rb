require_relative './test_config'

require_relative '../leaderboard'

class AppTest < MiniTest::Test
  def run(*args, &block)
    Sequel::Model.db.transaction(:rollback=>:always, :auto_savepoint=>true){super}
  end

  def test_can_return_top_flights_for_today
    second_best_flight = Flight.create(username: 'second_best', max_altitude: 3.5, submitted_at: Time.new(2010, 10, 1, 9))
    best_flight = Flight.create(username: 'best', max_altitude: 5.5, submitted_at: Time.new(2010, 10, 1, 12))
    worst_flight = Flight.create(username: 'worst', max_altitude: 0.5, submitted_at: Time.new(2010, 10, 1, 13))
    old_flight = Flight.create(username: 'old', max_altitude: 5.5, submitted_at: Time.new(2010, 9, 30, 9))
    Time.stub :now, Time.new(2010, 10, 1, 14) do
      leaderboard = Leaderboard.best_today(:limit => 2).map { |e| e.username }
      assert_equal ['best', 'second_best'], leaderboard
    end
  end
end
