function lagged_ini() {
    LaggedAPI.init('nevenfu_evade_gintvfoz','lagdevaF3001');
    }

var bestscr=0;
    function lagged_highscore(value){


value = value.replace(":", "");
value=parseInt(value);
    console.log(value);

if(value>bestscr){
  bestscr=value;
        var boardinfo={};
        boardinfo.score=value;
        boardinfo.board= "nevenfu_evade_hsbdmoe";
        LaggedAPI.Scores.save(boardinfo, function(response) {
        if(response.success) {
        console.log('high score saved')
        }else {
        console.log(response.errormsg);
        }
        });
}
    }

function lagged_ads() {

    LaggedAPI.APIAds.show('interstitial','nevenfu-evade','nevenfu-evade-game.png',function(response) {
        if(response.success) {
        console.log('ad done');
        }else {
        console.log('ad error, continue');
        }
        });

}
