require 'minitest/autorun'
require_relative '../../apps/mobile/fastlane/signing'

class SigningTest < Minitest::Test
  def profile
    { 'TeamIdentifier' => ['9D78WTZAD8'], 'UUID' => '11111111-2222-3333-4444-555555555555', 'Name' => 'TallSoon App Store', 'ExpirationDate' => Time.now + 3600,
      'Entitlements' => { 'application-identifier' => '9D78WTZAD8.com.belevate.tallsoon', 'com.apple.developer.team-identifier' => '9D78WTZAD8', 'get-task-allow' => false } }
  end

  def test_only_exact_valid_processed_build_is_reported_successful
    app = Struct.new(:id).new('123')
    klass = Struct.new(:app, :app_version, :version, :platform, :processing_state, keyword_init: true)
    attributes = { app: app, app_version: '1.0.0', version: '7', platform: 'IOS', processing_state: 'VALID' }
    expected = { app_id: '123', version: '1.0.0', number: 7 }
    assert TallSoonSigning.validate_build!(klass.new(**attributes), **expected)
    [{ processing_state: 'FAILED' }, { processing_state: 'INVALID' }, { processing_state: 'PROCESSING' }, { platform: 'TV_OS' }, { version: '6' }, { app_version: '2.0' }, { app: nil }].each do |patch|
      assert_raises(RuntimeError) { TallSoonSigning.validate_build!(klass.new(**attributes.merge(patch)), **expected) }
    end
    assert_raises(RuntimeError) { TallSoonSigning.validate_build!(nil, **expected) }
  end

  def test_accepts_exact_app_store_identity
    assert_equal profile['UUID'], TallSoonSigning.validate_profile!(profile)['UUID']
    assert TallSoonSigning.validate_profile!(profile.merge('ExpirationDate' => DateTime.now + 1))
  end

  def test_rejects_wrong_identity_expired_development_adhoc_and_enterprise_profiles
    [{ 'TeamIdentifier' => ['OTHER'] }, { 'ExpirationDate' => Time.now - 1 }, { 'ProvisionedDevices' => [] }, { 'ProvisionsAllDevices' => true }, { 'UUID' => '' }].each do |patch|
      assert_raises(RuntimeError) { TallSoonSigning.validate_profile!(profile.merge(patch)) }
    end
    ['application-identifier', 'com.apple.developer.team-identifier', 'get-task-allow'].each do |key|
      value = profile
      value['Entitlements'][key] = key == 'get-task-allow' ? true : 'wrong'
      assert_raises(RuntimeError) { TallSoonSigning.validate_profile!(value) }
    end
  end
end
