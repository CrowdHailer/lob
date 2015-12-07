
export default function(app){
  // validate app
  console.log(app);
  return {
    start: function(){
      console.log("start connection");
      setTimeout(function(){
        app.actions.failedConnection();
      }, 1000);
    },
    publish: function(){
      console.log("publishing");
    }
  };
};
