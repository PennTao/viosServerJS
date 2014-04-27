//public/javascripts/global.js

$(document).ready(function(){
    $('#post blockquote small').on('click', 'a.deletepost', deletePost);
    $('#follow').on('click', 'a.follow', follow);
    $('#follow').on('click', 'a.unfollow', unfollow);
});
function deletePost(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this message?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete;
        $.ajax({
            type: 'DELETE',
            url: '/u/' + $(this).attr('user') + '/delete/' + $(this).attr('rel')

        }).done(function (res) {

            // Check for a successful response and redirect to user's page
            if (res.redirectTo && res.msg == 'success') {
                window.location = res.redirectTo;
            }
            else {
                alert('error: ' + res.msg);
            }

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

function follow(event) {
    event.preventDefault();
    var confirmation = confirm('Are you sure you want to follow this user?');
    if (confirmation === true) {
        $.ajax({
            type: 'POST',
            data: '',
            url: '/u/' + $(this).attr('user') + '/follow'
        }).done(function (res) {
            if (res.redirectTo && res.msg == 'success') {
                window.location = res.redirectTo;
            }
            else {
                alert('error: ' + res.msg);
            }
        });
    }
    else {
        return false;
    }
}

function unfollow(event) {
    event.preventDefault();
    var confirmation = confirm('Are you sure you want to unfollow this user?');
    if (confirmation === true) {
        $.ajax({
            type: 'POST',
            url: '/u/' + $(this).attr('user') + '/unfollow'
        }).done(function (res) {
            if (res.redirectTo && res.msg == 'success') {
            
            }
            else {
                alert('error: ' + res.msg);
            }
        });
    }
    else {
        return false;
    }
}