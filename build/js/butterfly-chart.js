import all_data from './data.js';

//import slider_filter from "../../../js-modules/slider-filter.js";
//filter looks like: {prop:"variable name", bounds:[min, max] | [exact_value]}
// test is x >= min, x < max if bounds.length == 2, otherwise if length == 1 it is a test of equality
// e.g. [min, max)

export default function butterfly_chart(container, config){

    var width = 700;
    var aspect = 1;
    var height = width*aspect;
    var pad_top = 40;
    var pad_right = 10;
    var pad_bottom = 10;
    var pad_left = 45;
    var axis_width = 20;
    if(arguments.length < 2 || config == null){
        config = {};
    }

    var all_data_;
    if(config.hasOwnProperty("filter")){
        var filter_prop = config.filter.prop;
        var bounds = config.filter.bounds;

        all_data_ = all_data.filter(function(d){
            var test;
            var val = d[filter_prop];
            if(bounds.length == 1){
                test = val == bounds[0];
            }
            else{
                test = val >= bounds[0] && val < bounds[1];
            }
            return test;
        });
    }
    else{
        all_data_ = all_data.slice(0);
    }

    var outer_wrap = d3.select(container)
                 .style("overflow","visible")
                 .style("margin", "0rem auto")
                 .style("box-sizing", "border-box")
                 .style("padding","0px")
                 .style("max-width", "1400px")
                 ;

    var legend_wrap = outer_wrap.append("div").classed("c-fix",true).style("padding","0px 0px 1em 0px");
    legend_wrap.append("p").text("Count of cities:").style("float","left").style("margin","0px 15px 0px 0px");
    var legend_svg = legend_wrap.append("svg").attr("width","140px").attr("height","18px").style("float","left");

    var wrap = outer_wrap.append("div").style("width", width+"px").style("height", height+"px").style("position","relative");


    var svg = wrap.append("svg").attr("width","100%").attr("height","100%").style("overflow","visible")
    var g_main = svg.append("g").attr("transform", "translate(0,0)");


    var g_axes = g_main.append("g").classed("chart-axis",true);
    
    var g_hex = g_main.append("g");

    var g_points = g_main.append("g").style("visibility","hidden");
    var g_anno = g_main.append("g");

    if(config.hasOwnProperty("label")){
        g_main.append("text").attr("x","50%").attr("dx", pad_left/2)
              .attr("text-anchor", "middle")
              .attr("y",pad_top + 40).text(config.label)
              .classed("text-overlay",true)
              .style("font-weight","bold");
    }

    if(config.hasOwnProperty("dispatcher")){
        var points_shown = false;
        config.dispatcher.dispatch.on(config.dispatcher.label, function(){
            points_shown = !points_shown;

            g_points.style("visibility", points_shown ? "visible" : "hidden");
            g_hex.style("visibility", !points_shown ? "visible" : "hidden");
        })
    };

    var quadrants = wrap.append("div").style("position","absolute").style("top","0px").style("left","0px")
                    .style("width","100%").style("height","100%").style("display","none").classed("reading text-overlay",true);
                
    var quads = quadrants.selectAll("div").data([0,1,2,3])
                        .enter().append("div")
                        .style("position", "absolute")
                        .style("background-color","transparent")
                        .style("border","0px solid red")
                        .style("padding","10px 15px");


    //scales
    var x_scale = d3.scaleLinear().domain([-6,6]).range([pad_left, width-pad_right]); //non-black
    var y_scale = d3.scaleLinear().domain([-6,6]).range([height-pad_bottom, pad_top]); //black
    var col = d3.interpolateLab("#dffbf8", "#094a43");
    var colscale = d3.scaleLinear().domain([0,1]).range([0,1]);

    //axes
    var g_x_grid = g_axes.append("g"); //gridlines
    var g_y_grid = g_axes.append("g");
    var g_x = g_axes.append("g").attr("transform","translate(0,"+ (pad_top) + ")");
    var g_y = g_axes.append("g").attr("transform","translate(" + (pad_left) + ",0)");

    g_anno.append("text").text("Change in black population, 1970 to 2010").attr("x","100%").attr("y","10").attr("text-anchor","end").attr("dx", 0-pad_right).style("font-weight","bold").style("font-size","13px");
    g_anno.append("text").text("Change in non-black population, 1970 to 2010").attr("transform","rotate(-90) translate(0,15)").attr("x","-100%").attr("text-anchor","start").attr("dx", pad_bottom).style("font-weight","bold").style("font-size","13px");

    var ax_x = d3.axisTop().scale(x_scale).ticks(5);
    var ax_y = d3.axisLeft().scale(y_scale).ticks(5);

    //test width of wrap -- bounds of wrap dimensions set by  
    function dims(){
        try{
            var box = outer_wrap.node().getBoundingClientRect();
            width = box.right - box.left;

            if(width > 700){width = 700}

            var vp_height = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0));

        }
        catch(e){
            width = 400;
        }

        height = width*aspect;

        x_scale.range([pad_left, width-pad_right]); //non-black
        y_scale.range([height-pad_bottom, pad_top]); //black

    }

    function draw(){

        wrap.style("width", width+"px").style("height", height+"px");

        ax_x(g_x);
        ax_y(g_y);

        g_axes.selectAll("text").style("font-weight", function(d){
            return d==0 ? "bold" : "normal";
        });

        //vertical grid lines -- use x_scale
        var y_grid = g_y_grid.selectAll("line").data(x_scale.ticks());
        y_grid.exit().remove();
        y_grid.enter().append("line").merge(y_grid).attr("y1", pad_top).attr("y2", height-pad_bottom)
                                                  .attr("x1", function(d){return Math.floor(x_scale(d))+0.5})
                                                  .attr("x2", function(d){return Math.floor(x_scale(d))+0.5})

                                                  .style("stroke",function(d){return d==0 ? "#aaaaaa" : "#dddddd"});

        //horizontal grid lines -- use y_axis
        var x_grid = g_x_grid.selectAll("line").data(y_scale.ticks());
        x_grid.exit().remove();
        x_grid.enter().append("line").merge(x_grid).attr("x1", pad_left).attr("x2", width-pad_right)
                                                .attr("y1", function(d){return Math.floor(y_scale(d))+0.5})
                                                .attr("y2", function(d){return Math.floor(y_scale(d))+0.5})
                                                .style("stroke",function(d){return d==0 ? "#aaaaaa" : "#dddddd"});
                                          

        var pts_up = g_points.selectAll("circle").data(all_data_, function(d){return d.STPLFIPS});
        pts_up.exit().remove()
        var pts = pts_up.enter().append("circle").merge(pts_up)
                    .interrupt()
                    .attr("cx",function(d){return x_scale(d["mylog10.slopeNONB"])})
                    .attr("cy",function(d){return y_scale(d["mylog10.slopeB"])})
                    .attr("r","2")
                    .attr("fill","#0B8814")
                    .attr("fill-opacity",0.25);

        var hex = d3.hexbin().x(function(d){return x_scale(d["mylog10.slopeNONB"])})
                    .y(function(d){return y_scale(d["mylog10.slopeB"])})
                    .extent([[10,10], [width-10, height-10]]).radius(width/200)
                    ;

        var hexdat = hex(all_data_);
        
        var max_in_cell = config.hasOwnProperty("cell_max") ? config.cell_max : d3.max(hexdat, function(d){return d.length});
        
        colscale.domain([1, max_in_cell]);

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

        var leg_text = legend_svg.selectAll("text").data([1, max_in_cell]);
        leg_text.exit().remove();
        leg_text.enter().append("text").merge(leg_text)
                .text(function(d){return d})
                .attr("x", function(d,i){return i==0 ? "0%" : "100%"})
                .attr("y","14")
                .style("font-size","13px")
                .attr("text-anchor", function(d,i){return i==0 ? "start" : "end"})
                .attr("dx", function(d,i){return i==0 ? "2" : "-2"})
                ;

        var leg_entries = legend_svg.selectAll("rect").data(d3.range(0, 51));
        leg_entries.exit().remove();
        leg_entries.enter().append("rect").merge(leg_entries)
                .attr("width","2")
                .attr("height","10")
                .attr("x", function(d,i){return (i*2) + 15.5})
                .attr("y","4.5")
                .attr("stroke",function(d,i){
                    return col((i*2)/100);
                })
                .attr("fill", function(d,i){
                    return col((i*2)/100);
                })
                ;
        
        quads.each(function(d,i){
            var w = (width - pad_left - pad_right) / 2;
            var h = (height - pad_top - pad_bottom) / 2;

            d3.select(this).style("width",w+"px")
                .style("height",h+"px")
                .style("top", i < 2 ? pad_top+"px" : (pad_top + h)+"px")
                .style("left", i == 0 || i == 2 ? pad_left+"px" : (pad_left + w)+"px")
                ;
        })
    }

    function update_sequence(callback){
        setTimeout(function(){
            //set dimensions
            dims();

            //set scales

            //draw
            draw();

            //set to full opacity;
            svg.style("opacity", "1");

            if(typeof callback === "function"){
                callback.call({quadrants:quads, quadrant_wrap:quadrants});
            }
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