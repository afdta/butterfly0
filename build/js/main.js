import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import wind_map from './wind-map.js';


//main function
function main(){


  //local
  dir.local("./");
  dir.add("assets", "assets");
  //dir.add("dirAlias", "path/to/dir");


  //production data
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  //dir.add("dirAlias", "rackspace-slug/path/to/dir");
  var compat = degradation(document.getElementById("metro-interactive"));


  //browser degradation
  if(compat.browser()){
    //run app...
    var main_wrap = d3.select("#metro-interactive");
    var map_wrap = main_wrap.append("div");

    wind_map(map_wrap.node(), 3000, 2000);
  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
