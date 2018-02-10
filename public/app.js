$(document).ready(function() {
    $('.scrape').on('click', function() {
        $.get('/scrape', function(data) {
            location.reload(true);
        });
    });
});