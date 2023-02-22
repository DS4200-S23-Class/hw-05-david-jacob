/*
HW-05
02/21/2023
 */
// setting up the basics
const FRAME_HEIGHT = 600;
const FRAME_WIDTH = 600;
const MARGINS = {left:50,
                right: 50,
                top:50,
                bottom:50};

const FRAME1 = d3.select('#vis1')
                    .append('svg')
                        .attr('height', FRAME_HEIGHT)
                        .attr('width', FRAME_WIDTH)
                        .attr('class', 'frame');

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right

// Read the csv file
function build_scatterplot() {
    d3.csv('data/scatter-data.csv').then((data) => {
        // Establish max bounds for data
        const MAX_X = d3.max(data, (d) => {
            return parseInt(d.x)
        });
        const MAX_Y = d3.max(data, (d) => {
            return parseInt(d.y)
        })

        // making scaling functions for both x and y values
        const X_SCALE = d3.scaleLinear()
            .domain([0, MAX_X])
            .range([0, VIS_WIDTH]);

        const Y_SCALE = d3.scaleLinear()
            .domain([0, MAX_Y])
            .range([VIS_HEIGHT, 0]);

        // adding points
        FRAME1.selectAll('points')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', (d) => {
                return (MARGINS.left + X_SCALE(d.x))
            })
            .attr('cy', (d) => {
                return (MARGINS.top + Y_SCALE(d.y))
            })
            .attr('r', 8)
            .attr('class', 'point');

        // x axis creation
        FRAME1.append('g')
            .attr('transform', 'translate(' + MARGINS.left + ',' + (VIS_HEIGHT + MARGINS.top) + ')')
            .call(d3.axisBottom(X_SCALE).ticks(10))
            .attr('font-size', '10px')

        // y axis creation
        FRAME1.append('g')
            .attr('transform', 'translate(' + MARGINS.top + ',' + MARGINS.left + ')')
            .call(d3.axisLeft(Y_SCALE).ticks(10))
            .attr('font-size', '10px')


        function plotPoint(){
            // Function retrieves the coordinates from the form and scales them accordingly
            let xVal = document.getElementById('x-val').value;
            let yVal = document.getElementById('y-val').value;
            FRAME1.append('circle')
                .attr('cx', MARGINS.left + X_SCALE(xVal))
                .attr('cy', MARGINS.top + Y_SCALE(yVal))
                .attr('r', 8)
                .attr('class', 'point')
                // add the on click functionality
                .on('click', toggle_border);

        }
        function find_point(point){
            // Function converts the on-screen position back to scaled coordinates.
            // Rounding is necessary because sometimes the inversion yields a very close flaoting point number
            true_x = Math.round(X_SCALE.invert(point.getAttribute('cx') - MARGINS.left))
            true_y = Math.round(Y_SCALE.invert(point.getAttribute('cy') - MARGINS.top))

            // Update the inner html with the coordinates
            document.getElementById('selected-point').innerHTML = "Most Recent Point: " +
                '(' + true_x + ',' + true_y + ')';
        }

        // Function that toggles the border and finds the coordinates
        function toggle_border(){
             d3.select(this).classed('border', d3.select(this).classed('border') ? false : true);
             find_point(this);

        };


        // toggling border and coordinate search for all points in frame on click
        FRAME1.selectAll('.point')
            .on("click", toggle_border)

        // Add click listener to the submit button
        document.getElementById('subButton')
            .addEventListener('click', plotPoint)
    });
};

// setting up frame
const FRAME2 = d3.select('#vis2')
                    .append('svg')
                        .attr('height', FRAME_HEIGHT)
                        .attr('width', FRAME_WIDTH)
                        .attr('class', 'frame');

function build_barchart() {
    d3.csv('data/bar-data.csv').then((data) => {
        const MAX_Y = d3.max(data, (d) => {
            return parseInt(d.amount)
        });
        const PADDING = 21

        const Y_SCALE = d3.scaleLinear()
            .domain([0, MAX_Y + PADDING])
            .range([VIS_HEIGHT, 0]);

        // scaling on a band because the values are not quantitative on the x axis
        const X_SCALE = d3.scaleBand()
            .range([0, VIS_WIDTH])
            .padding(0.1)
            .domain(data.map(function(d) { return d.category; }));

        // add bars
        FRAME2.selectAll('bars')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function(d) { return X_SCALE(d.category) + MARGINS.left; })
            .attr('width', X_SCALE.bandwidth())
            .attr('y', function(d) { return Y_SCALE(d.amount) + MARGINS.top; })
            .attr('height', function(d) { return VIS_HEIGHT - Y_SCALE(d.amount); })
            .attr("fill", "skyblue")
            .attr('class', 'rect');

        // add y axis
        FRAME2.append('g')
            .attr('transform', 'translate(' + MARGINS.top + ',' + MARGINS.left + ')')
            .call(d3.axisLeft(Y_SCALE).ticks(10))
            .attr('font-size', '10px');

        // add x axis
        FRAME2.append('g')
            .attr('transform', 'translate(' + MARGINS.left + ',' + (VIS_HEIGHT + MARGINS.top) + ')')
            .call(d3.axisBottom(X_SCALE).ticks(7))
            .attr('font-size', '10px');

        // adding a tooltip for hover functionality
        const TOOLTIP = d3.select("#vis2")
                        .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

        function handleMouseover(event, d) {
            TOOLTIP.style("opacity", 1);
        }

        // handing a mouse movement
        function handleMousemove(event, d) {
            TOOLTIP.html("Category: " + d.category + "<br>Amount: " + d.amount)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 50) + "px")
        }

        function handleMouseleave(event, d) {
            TOOLTIP.style("opacity", 0)
        }

        // tooltip functionality on different situations
        FRAME2.selectAll(".rect")
                .on("mouseover", handleMouseover)
                .on("mousemove", handleMousemove)
                .on("mouseleave", handleMouseleave);
    });
}

build_scatterplot();
build_barchart();

