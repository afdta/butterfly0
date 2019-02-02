import all_data from './data.js';

import slider_filter from "../../../js-modules/slider-filter.js";

export default function butterfly_chart(container){
    //one-time setup
    var width = 400;
    var height = width;
    var vp_height; //viewport height
    var minheight = 400;
    var minwidth = 400;
    var maxwidth = 1600;


    //padding is applied to container, so wrap has container width minus pad to work with
    var chartpad = [5, 10]; //t/b, r/l
    var padlr = 2*chartpad[1];
    var padtb = 2*chartpad[0];

    var outer_wrap = d3.select(container)
                 .style("overflow","visible")
                 .style("margin", "0rem auto")
                 .style("box-sizing", "border-box")
                 .style("padding","0px")
                 .style("max-width", maxwidth+"px")
                 ;

    outer_wrap.selectAll("*").remove();

    var chart_title = outer_wrap.append("p").text("Chart").style("font-size","2rem").style("font-weight","bold");

    var sliders = outer_wrap.append("div");
    
    slider_filter(sliders.node()).title("Filter by X").domain([0,100]).valueFormat(function(v){return Math.round(v*10)/10}).filter(function(min, max){
        console.log(min + " " + max);
    });

    var wrap = outer_wrap.append("div")
                        .style("min-width",minwidth+"px")
                        .style("min-height",minheight+"px")
                        .style("max-width",maxwidth+"px")
                        .style("height","85vh")
                        ;

    var svg = wrap.append("svg").attr("width","100%").attr("height","100%").style("overflow","visible");
    var g_main = svg.append("g").attr("transform", "translate(" + chartpad[1] + "," + chartpad[0] + ")" );

    var g_axes = g_main.append("g");
    var g_points = g_main.append("g");
    var g_anno = g_main.append("g");

    var ranges = {x:[chartpad[1], width-chartpad[1]], y:[height-chartpad[0], chartpad[0]]};
    var scales = {};
    scales.x = d3.scaleLinear().domain([-6,6]).range(ranges.x); //white
    scales.y = d3.scaleLinear().domain([-6,6]).range(ranges.y) //black

    scales.yln = d3.scaleLinear().domain([-0.1, 0.15]).range(ranges.y); //black, percent change
    scales.xln = d3.scaleLinear().domain([-0.06,0.07]).range(ranges.x) //white, percent change

    scales.xyr = d3.scaleLinear().domain([1970,2010]).range(ranges.x); //years
    scales.yshr = d3.scaleLinear().domain([0,1]).range(ranges.y); //share, 0 to 1

                 
    //g_anno.append("path").attr("d","M0,0 l500,500").attr("stroke","blue");

    //test width of wrap -- bounds of wrap dimensions set by  
    function dims(){
        try{
            var box = wrap.node().getBoundingClientRect();
            
            width = box.right - box.left;
            height = box.bottom - box.top;

            vp_height = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0));

            ranges.x = [chartpad[1], width-chartpad[1]];
            ranges.y = [height-chartpad[0], chartpad[0]];

            scales.x.range(ranges.x);
            scales.xln.range(ranges.x);
            scales.y.range(ranges.y);
            scales.yln.range(ranges.y);

            //width = box_width > 1600 ? 1600 - padlr : box_width - padlr;
            //height = box_height > vp_height ? (vp_height > minheight ? vp_height - padtb : minheight - padtb) : box_height - padtb;
        }
        catch(e){
            width = minwidth;
            height = minheight;
        }
    }

    var pts; //points
    var lines; //trend lines
    function draw(){
        var pts_up = g_points.selectAll("circle").data(all_data, function(d){return d.STPLFIPS});
        pts_up.exit().remove()
        pts = pts_up.enter().append("circle").merge(pts_up)
                    .interrupt()
                    .attr("cx",function(d){return scales.x(d["mylog10.slopeNONB"])})
                    .attr("cy",function(d){return scales.y(d["mylog10.slopeB"])})
                    .attr("r","1")
                    .attr("fill","blue")
                    .attr("fill-opacity",0.3);

        //annual percent change            
        //pts.transition().delay(function(d,i){
        //    return d.qd*1000 + 1000;
        //}).duration(2000)
        //.attr("cx",function(d){return scales.xln(d.blnw)})
        //.attr("cy",function(d){return scales.yln(d.blnb)})
        
    }


    function update_sequence(){
        setTimeout(function(){
            //set dimensions
            dims();

            //set scales

            //draw
            draw();

            //set to full opacity;
            svg.style("opacity", "1");
        },0)
    }

    //make responsive
    var resizeTimer;
    window.addEventListener("resize", function(){
        clearTimeout(resizeTimer);
        svg.style("opacity","0.3");
        resizeTimer = setTimeout(update_sequence, 200);
    });

    return update_sequence;
}