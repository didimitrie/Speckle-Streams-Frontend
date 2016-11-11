module.exports = {
  init( cb ){

    window.ga = window.ga||function(){(window.ga.q=window.ga.q||[]).push(arguments)};window.ga.l=+new Date;
    window.ga('create', 'UA-85019980-1', 'auto');
    window.ga('send', 'pageview');

    if(cb) cb()
  }
}