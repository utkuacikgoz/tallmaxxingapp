require 'date'

module TallSoonSigning
  BUNDLE_ID = 'com.belevate.tallsoon'
  TEAM_ID = '9D78WTZAD8'

  def self.validate_build!(build, app_id:, version:, number:)
    valid = build && build.app&.id == app_id && build.app_version == version &&
      build.version == number.to_s && build.platform == 'IOS' && build.processing_state == 'VALID'
    raise 'Apple did not confirm this exact iOS build as VALID; check TestFlight before retrying' unless valid
    build
  end

  def self.validate_profile!(profile, now: Time.now)
    entitlements = profile.fetch('Entitlements', {})
    valid = profile['TeamIdentifier'] == [TEAM_ID] &&
      entitlements['application-identifier'] == "#{TEAM_ID}.#{BUNDLE_ID}" &&
      entitlements['com.apple.developer.team-identifier'] == TEAM_ID &&
      entitlements['get-task-allow'] == false &&
      !profile.key?('ProvisionedDevices') && !profile['ProvisionsAllDevices'] &&
      (profile['ExpirationDate'].is_a?(Time) || profile['ExpirationDate'].is_a?(DateTime)) && profile['ExpirationDate'].to_time > now &&
      profile['UUID'].to_s.match?(/\A[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\z/i) && !profile['Name'].to_s.empty?
    raise 'Need an unexpired App Store distribution profile for com.belevate.tallsoon, team 9D78WTZAD8' unless valid
    profile
  end
end
