require 'rake/testtask'

test_tasks = Dir['server/test/*/'].map { |d| File.basename(d) }

test_tasks.each do |folder|
  Rake::TestTask.new("test:#{folder}") do |test|
    test.pattern = "server/test/#{folder}/**/*_test.rb"
    test.verbose = true
  end
end

desc "Run application test suite"
Rake::TestTask.new("test") do |test|
  test.pattern = "server/test/**/*_test.rb"
  test.verbose = true
end
