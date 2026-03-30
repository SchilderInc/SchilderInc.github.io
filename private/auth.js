// Shared auth guard for all private pages.
// Include this script at the top of every private page.
(function () {
    if (sessionStorage.getItem('authenticated') !== 'true') {
        window.location.replace('/index.html');
    }
})();
