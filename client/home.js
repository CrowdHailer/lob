$(function() {
  var $mobileSupported = $('.mobile-ready'),
      $mobileNotSupported = $('.mobile-not-ready'),
      $channelName = $(this).find('input[name=channel-name]');

  var gn = new GyroNorm();
  gn.init().then(function() {
    if (gn.isAvailable(GyroNorm.DEVICE_ORIENTATION) || gn.isAvailable(GyroNorm.ACCELERATION_INCLUDING_GRAVITY)) {
      $mobileSupported.show();
      $mobileNotSupported.hide();
    }
  });

  $('form.track-flight').on('submit', function(event) {
    if ($channelName.val().replace(/^\s+|\s+$/g,"").length === 0) {
      event.preventDefault();
      $(this).find('input[name=channel-name]').focus();
      alert("Please enter a valid live Lob code from another device");
    }
  });
});
