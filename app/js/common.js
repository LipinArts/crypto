$(function() {
  $("#nav-toggle").click(function() {
    $("#nav-toggle").toggleClass("active");
    if ($("nav").is(":hidden")) {
      $("nav").addClass("visible");
    } else {
      $("nav").removeClass("visible");
    }
    return false;
  });
  $("nav ol a").click(function() {
    $("nav").removeClass("visible");
    $("#nav-toggle").removeClass("active");
  });

  var $page = $("html, body");
  $("nav a").click(function() {
    $page.animate(
      {
        scrollTop: $($.attr(this, "href")).offset().top
      },
      600
    );
    return false;
  });
});
