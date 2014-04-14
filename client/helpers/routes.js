Router.configure({
  notFoundTemplate: 'tmplt_notFound',
  loadingTemplate: 'tmplt_loading'
});

Router.map( function () {
  
  this.route('tmplt_home', {
    path: '/'
  });
  
  this.route('tmplt_pacman', {
    path: 'pacman'
  });
  
});
  
