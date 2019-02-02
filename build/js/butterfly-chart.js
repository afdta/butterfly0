import all_data from './data.js';

//import slider_filter from "../../../js-modules/slider-filter.js";

export default function butterfly_chart(container){

    var width = 900;
    var aspect = 6/9;
    var height = width*aspect;


    var outer_wrap = d3.select(container)
                 .style("overflow","visible")
                 .style("margin", "0rem auto")
                 .style("box-sizing", "border-box")
                 .style("padding","0px")
                 .style("max-width", "1400px")
                 ;

    var wrap = outer_wrap.append("div").style("width", width+"px").style("height", height+"px");

    var svg = wrap.append("svg").attr("width","100%").attr("height","100%").style("overflow","visible");
    var g_main = svg.append("g").attr("transform", "translate(0,0)");


    var g_axes = g_main.append("g");
    var g_points = g_main.append("g");
    var g_hex = g_main.append("g");
    
    var g_anno = g_main.append("g");

    var x_scale = d3.scaleLinear().domain([-6,6]).range([10, width-10]); //non-black
    var y_scale = d3.scaleLinear().domain([-6,6]).range([height-10, 10]) //black

    //test width of wrap -- bounds of wrap dimensions set by  
    function dims(){
        try{
            var box = outer_wrap.node().getBoundingClientRect();
            width = box.right - box.left;
            var vp_height = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0));

        }
        catch(e){
            width = 400;
        }

        height = width*aspect;
        x_scale.range([10, width-10]);
        y_scale.range([height-10, 10]);
    }

    function draw(){

        wrap.style("width", width+"px").style("height", height+"px");

        var pts_up = g_points.selectAll("circle").data(all_data, function(d){return d.STPLFIPS});
        pts_up.exit().remove()
        var pts = pts_up.enter().append("circle").merge(pts_up)
                    .interrupt()
                    .attr("cx",function(d){return x_scale(d["mylog10.slopeNONB"])})
                    .attr("cy",function(d){return y_scale(d["mylog10.slopeB"])})
                    .attr("r","1")
                    .attr("fill","blue")
                    .attr("fill-opacity",0.3);

        var hex = d3.hexbin().x(function(d){return x_scale(d["mylog10.slopeNONB"])})
                    .y(function(d){return y_scale(d["mylog10.slopeB"])})
                    .extent([[10,10], [width-10, height-10]]).radius(width/200)
                    ;

        var hexdat = hex(all_data);
        var max_in_cell = d3.max(hexdat, function(d){return d.length});
        console.log(max_in_cell);

        var col = d3.interpolateLab("#dffbf8", "#094a43");
        var colscale = d3.scaleLinear().domain([0, max_in_cell]).range([0,1]);

        var cells = g_hex.selectAll("path").data(hexdat);
        cells.exit().remove();
        cells.enter().append("path").merge(cells)
                    .attr("d", function(d){
                        return "M" + d.x + "," + d.y + hex.hexagon(); 
                    })
                    .attr("fill",function(d){
                        //console.log(d);
                        return col(colscale(d.length));
                    })
                    .attr("stroke",function(d){
                        return d3.color(col(colscale(d.length))).darker(0.25);
                    });
        
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