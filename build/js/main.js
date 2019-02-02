import dir from "../../../js-modules/rackspace.js";
import degradation from "../../../js-modules/degradation.js";

import butterfly_chart from './butterfly-chart.js';


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
    
    var chart_wrap = main_wrap.append("div");
    chart_wrap.append("p").text("CHART")

    var update_chart = butterfly_chart(chart_wrap.node());

    update_chart();

  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
