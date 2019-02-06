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

    var dispatch = d3.dispatch("show_dots");

    d3.select("#show-dots").on("mousedown", function(){
      dispatch.call("show_dots");
    });

    function build_dispatch(label){
      return {dispatch:dispatch, label:"show_dots." + label}
    }

    //run app...
    var chart_wrap0 = d3.select("#butterfly-chart0");
    var chart_wrap1 = d3.select("#butterfly-chart1");

    //Midwest Northeast Southeast West
    var chart_wrap2 = d3.select("#butterfly-chart2");
    var chart_wrap3 = d3.select("#butterfly-chart3");
    var chart_wrap4 = d3.select("#butterfly-chart4");
    var chart_wrap5 = d3.select("#butterfly-chart5");



    var update_chart0 = butterfly_chart(chart_wrap0.append("div").node(), {dispatcher: build_dispatch("a")});
    var update_chart1 = butterfly_chart(chart_wrap1.append("div").node(), {dispatcher: build_dispatch("b")});

    var update_chart2 = butterfly_chart(chart_wrap2.append("div").node(), {filter: {prop:"REGION", bounds:["Midwest"]}, label:"Midwest", dispatcher: build_dispatch("c")});
    var update_chart3 = butterfly_chart(chart_wrap3.append("div").node(), {filter: {prop:"REGION", bounds:["Northeast"]}, label:"Northeast", dispatcher: build_dispatch("d") });
    var update_chart4 = butterfly_chart(chart_wrap4.append("div").node(), {filter: {prop:"REGION", bounds:["Southeast"]}, label:"Southeast", dispatcher: build_dispatch("e") });
    var update_chart5 = butterfly_chart(chart_wrap5.append("div").node(), {filter: {prop:"REGION", bounds:["West"]}, label:"West", dispatcher: build_dispatch("f") });

    function highlight_quadrants(){

      var text = [
        '"This is what characterizes places in this quadrant. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed enim lorem, tristique lobortis lacus non, dignissim pellentesque quam. Sed id lectus sed tortor finibus interdum."',
        '"This is what\'s going on here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed enim lorem, tristique lobortis lacus non, dignissim pellentesque quam. Sed id lectus sed tortor finibus interdum."',
        '"And so on... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed enim lorem, tristique lobortis lacus non, dignissim pellentesque quam. Sed id lectus sed tortor finibus interdum."',
        '"And so forth... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed enim lorem, tristique lobortis lacus non, dignissim pellentesque quam. Sed id lectus sed tortor finibus interdum."'
      ]

      var quads = this.quadrants;
      this.quadrant_wrap.style("display","block");

      function highlight(i){
        var j = ++i % 4;
        var q = quads.filter(function(d){return d==j}).style("opacity","0").html('<p>' + text[j] + '</p>');
        
        q.transition().style("opacity","1").duration(300).transition().delay(5000).duration(300).style("opacity","0")
          .on("end", function(){
            highlight(j);
          })
      }

      highlight(-1);
    }

    update_chart0(highlight_quadrants);
    update_chart1();

    //regions
    update_chart2();
    update_chart3();
    update_chart4();
    update_chart5();

  }


} //close main()


document.addEventListener("DOMContentLoaded", main);
