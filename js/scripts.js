async function drawAnnualTemperatureChange() {
    // Set the dimensions and margins of the graph
    var margin = 100;
    var width  = 1000 - margin;
    var height = 600 - margin;
    
    // Append the svg object to the body of the page
    const svg = d3.select("#annualtempchart")
                  .append("svg")
                  .attr("width", width + margin)
                  .attr("height", height + margin)
                  .append("g")
                  .attr("transform", "translate(" + margin/2 + "," + margin/2 + ")");

    // Chart Title
    svg.append('text')
        .attr('x', width/2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 24)
        .style('fill', "#0000FF")
        .text('Global Average Surface Temperature');

    //Read the data
    d3.csv("/data/NOAA_WorldTemperature.csv", function(d) {
        return { date : d3.timeParse("%Y")(d.date), value : d.value }
    })
    .then(function(dataset) {
        // Accessors
        const xAccessor = d => d.date
        const yAccessor = d => d.value

        // Scales
        var xScale = d3.scaleTime()
                        .domain(d3.extent(dataset, function(d) { return d.date; }))
                        .range([ 0, width ]);
        var yScale = d3.scaleLinear()
                        .domain([-1.0, d3.max(dataset, function(d) { return +d.value; })])
                        .range([ height, 0 ]);

        // X Axis label
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 14)
            .style('fill', "#000000")
            .text('Year');

        // Y Axis label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(-30,' + (height/2) + ')rotate(-90)')
            .style('font-family', 'Helvetica')
            .style('font-size', 14)
            .style('fill', "#000000")
            .text('Difference from 1901-2000 average (°C)');

        // Annotation - most important message
        svg.append('text')
            .attr('x', width/2 + 130)
            .attr('y', height - 50)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 22)
            .style('fill', "red")
            .text('Rate of warming/decade doubled from 1981');
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style('fill', "#000000")
            .style('stroke', "#000000")
            .call(d3.axisBottom(xScale));
    
        // Add Y axis
        svg.append("g")
            .style('fill', "#000000")
            .style('stroke', "#000000")
            .call(d3.axisLeft(yScale));
    
        // Add mean line
        svg.append("path")
            .data([dataset])
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.0)
            .attr("d", d3.line()
                .x(function(d) { return xScale(d.date) })
                .y(function(d) { return yScale(0) })
            )

        // Add the line
        svg.append("path")
            .data([dataset])
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 4.0)
            .attr("d", d3.line()
                .x(function(d) { return xScale(d.date) })
                .y(function(d) { return yScale(d.value)})
            )

        // Tooltip pointer circle
        const tooltipDot = svg.append("circle")
                              .attr("r", 5)
                              .attr("fill", "#fc8781")
                              .attr("stroke", "black")
                              .attr("stroke-width", 2)
                              .style("opacity", 0)
                              .style("pointer-events", "none");
        
        const tooltip = d3.select("#annualtempchartooltip");

        svg.append("rect")
           .attr("width", width)
           .attr("height", height)
           .style("opacity", 0)
           .on("touchmouse mousemove", function (event) {
                const mousePos = d3.pointer(event, this);
                
                // x coordinate stored in mousePos index 0
                const date = xScale.invert(mousePos[0]);

                // Custom Bisector - left, center, right
                const dateBisector = d3.bisector(xAccessor).left;
                const bisectionIndex = dateBisector(dataset, date);
                
                // math.max prevents negative index reference error
                const hoveredIndexData = dataset[Math.max(0,bisectionIndex - 1)];

                // Update Image
                tooltipDot.style("opacity", 0.75)
                          .attr("cx", xScale(xAccessor(hoveredIndexData)))
                          .attr("cy", yScale(yAccessor(hoveredIndexData)))
                          .raise();

                tooltip.style("display", "block")
                       .style("top", `${yScale(yAccessor(hoveredIndexData)) + 50}px`)
                       .style("left", `${xScale(xAccessor(hoveredIndexData)) + 200}px`);

                var tempColor = ( yAccessor(hoveredIndexData) <= 0 ) ? "green" : "#FB8C00";
                tooltip.select(".temperature").text(`Change: ${yAccessor(hoveredIndexData)} °C`)
                                              .style("color", `${tempColor}`);

                tooltip.select(".year").text(`Year: ${xAccessor(hoveredIndexData).getFullYear()}`)
            })
            .on("mouseleave", function () {
                tooltipDot.style("opacity", 0);
                tooltip.style("display", "none");
            });
    });
}

async function drawACO2Change() {
    // Set the dimensions and margins of the graph
    var margin = 100;
    var width  = 800 - margin;
    var height = 600 - margin;
    
    // Append the svg object to the body of the page
    const svg = d3.select("#co2changechart")
                  .append("svg")
                  .attr("width", width + margin)
                  .attr("height", height + margin)
                  .append("g")
                  .attr("transform", "translate(" + margin/2 + "," + margin/2 + ")");

    // Chart Title
    svg.append('text')
        .attr('x', width/2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 24)
        .style('fill', "#0000FF")
        .text('Monthly Atmospheric Carbon Dioxide Concentrations');

    //Read the data
    d3.csv("/data/Atmospheric_CO2_Concentrations.csv", function(d) {
        if (d.value > 300) {
            return { date : d3.timeParse("%YM%m")(d.date), value : d.value }
        }
    })
    .then(function(dataset) {
        // Accessors
        const xAccessor = d => d.date
        const yAccessor = d => d.value

        // Scales
        var xScale = d3.scaleTime()
                        .domain(d3.extent(dataset, function(d) { return d.date; }))
                        .range([ 0, width ]);
        var yScale = d3.scaleLinear()
                        .domain([300, d3.max(dataset, function(d) { return +d.value; })])
                        .range([ height, 0 ]);

        // X Axis label
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 14)
            .style('fill', "#000000")
            .text('YEAR');

        // Y Axis label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(-30,' + (height/2) + ')rotate(-90)')
            .style('font-family', 'Helvetica')
            .style('font-size', 14)
            .style('fill', "#000000")
            .text('CO2 parts per million');

        // Annotation - most important message
        svg.append('text')
            .attr('x', width/2 + 130)
            .attr('y', height - 50)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 22)
            .style('fill', "#EF6C00")
            .text('Seasonal fluctuation in CO2 level occurs every year.');

        // Annotation - most important message
        svg.append('text')
            .attr('x', width/2 + 130)
            .attr('y', height - 20)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 22)
            .style('fill', "#EF6C00")
            .text('But year-to-year trend is increased CO2 level');
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style('fill', "#000000")
            .style('stroke', "#000000")
            .call(d3.axisBottom(xScale));
    
        // Add Y axis
        svg.append("g")
            .style('fill', "#000000")
            .style('stroke', "#000000")
            .call(d3.axisLeft(yScale));
    
        // Scatter plot
        svg.append('g')
           .selectAll("dot")
           .data(dataset)
           .enter()
           .append("circle")
           .attr("cx", function (d) { return xScale(d.date); } )
           .attr("cy", function (d) { return yScale(d.value); } )
           .attr("r", 2)
           .style("fill", "#CC0000");

        // Tooltip pointer circle
        const tooltipDot = svg.append("circle")
                              .attr("r", 5)
                              .attr("fill", "#fc8781")
                              .attr("stroke", "black")
                              .attr("stroke-width", 2)
                              .style("opacity", 0)
                              .style("pointer-events", "none");
        
        const tooltip = d3.select("#co2changecharttooltip");

        svg.append("rect")
           .attr("width", width)
           .attr("height", height)
           .style("opacity", 0)
           .on("touchmouse mousemove", function (event) {
                const mousePos = d3.pointer(event, this);
                
                // x coordinate stored in mousePos index 0
                const date = xScale.invert(mousePos[0]);

                // Custom Bisector - left, center, right
                const dateBisector = d3.bisector(xAccessor).left;
                const bisectionIndex = dateBisector(dataset, date);
                
                // math.max prevents negative index reference error
                const hoveredIndexData = dataset[Math.max(0,bisectionIndex - 1)];

                // Update Image
                tooltipDot.style("opacity", 0.75)
                          .attr("cx", xScale(xAccessor(hoveredIndexData)))
                          .attr("cy", yScale(yAccessor(hoveredIndexData)))
                          .raise();

                tooltip.style("display", "block")
                       .style("top", `${yScale(yAccessor(hoveredIndexData)) + 50}px`)
                       .style("left", `${xScale(xAccessor(hoveredIndexData)) + 200}px`);

                tooltip.select(".CO2ppm").text(`CO2 ppm: ${yAccessor(hoveredIndexData)}`);

                tooltip.select(".year").text(`Year: ${xAccessor(hoveredIndexData).getFullYear()}`)
            })
            .on("mouseleave", function () {
                tooltipDot.style("opacity", 0);
                tooltip.style("display", "none");
            });
    });
}

async function drawMeanSeaLevelChange() {
    // Set the dimensions and margins of the graph
    var margin = 100;
    var width  = 800 - margin;
    var height = 600 - margin;
    
    // Append the svg object to the body of the page
    const svg = d3.select("#seallevelchangechart")
                    .append("svg")
                    .attr("width", width + margin)
                    .attr("height", height + margin)
                    .append("g")
                    .attr("transform", "translate(" + margin/2 + "," + margin/2 + ")");

    // Chart Title
    svg.append('text')
        .attr('x', width/2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 24)
        .style('fill', "#0000FF")
        .text('Mean world sea level change');

    //Read the data
    d3.csv("/data/Change_in_Mean_Sea_Levels.csv", function(d) {
        if (d.Measure == 'World') {
            return { date : d3.timeParse("D%m/%d/%Y")(d.Date), value : d.Value }
        }
    })
    .then(function(dataset) {
        // Accessors
        const xAccessor = d => d.date
        const yAccessor = d => d.value

        // Scales
        var xScale = d3.scaleTime()
                        .domain(d3.extent(dataset, function(d) { return d.date; }))
                        .range([ 0, width ]);
        var yScale = d3.scaleLinear()
                        .domain([d3.min(dataset, function(d) { return +d.value; }), d3.max(dataset, function(d) { return +d.value; })])
                        .range([ height, 0 ]);

        // X Axis label
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 14)
            .style('fill', "#000000")
            .text('Year');

        // Y Axis label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(-30,' + (height/2) + ')rotate(-90)')
            .style('font-family', 'Helvetica')
            .style('font-size', 14)
            .style('fill', "#000000")
            .text('Mean sea level change in mm');

        // Annotation - most important message
        svg.append('text')
            .attr('x', width/2 + 130)
            .attr('y', height - 50)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 22)
            .style('fill', "red")
            .text('Rate of mean sea level change/decade more ');

        // Annotation - most important message
        svg.append('text')
            .attr('x', width/2 + 130)
            .attr('y', height - 20)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 22)
            .style('fill', "red")
            .text('than doubled from 2013');
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style('fill', "#000000")
            .style('stroke', "#000000")
            .call(d3.axisBottom(xScale));
    
        // Add Y axis
        svg.append("g")
            .style('fill', "#000000")
            .style('stroke', "#000000")
            .call(d3.axisLeft(yScale));
    
        // Scatter plot
        svg.append('g')
            .selectAll("dot")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xScale(d.date); } )
            .attr("cy", function (d) { return yScale(d.value); } )
            .attr("r", 2)
            .style("fill", "blue");

        // Tooltip pointer circle
        const tooltipDot = svg.append("circle")
                                .attr("r", 5)
                                .attr("fill", "#fc8781")
                                .attr("stroke", "black")
                                .attr("stroke-width", 2)
                                .style("opacity", 0)
                                .style("pointer-events", "none");
        
        const tooltip = d3.select("#sealevelchangecharttooltip");

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("opacity", 0)
            .on("touchmouse mousemove", function (event) {
                const mousePos = d3.pointer(event, this);
                
                // x coordinate stored in mousePos index 0
                const date = xScale.invert(mousePos[0]);

                // Custom Bisector - left, center, right
                const dateBisector = d3.bisector(xAccessor).left;
                const bisectionIndex = dateBisector(dataset, date);
                
                // math.max prevents negative index reference error
                const hoveredIndexData = dataset[Math.max(0,bisectionIndex - 1)];

                // Update Image
                tooltipDot.style("opacity", 0.75)
                            .attr("cx", xScale(xAccessor(hoveredIndexData)))
                            .attr("cy", yScale(yAccessor(hoveredIndexData)))
                            .raise();

                tooltip.style("display", "block")
                        .style("top", `${yScale(yAccessor(hoveredIndexData)) + 50}px`)
                        .style("left", `${xScale(xAccessor(hoveredIndexData)) + 200}px`);

                tooltip.select(".sealevelchange").text(`CO2 ppm: ${yAccessor(hoveredIndexData)}`);

                tooltip.select(".year").text(`Year: ${xAccessor(hoveredIndexData).getFullYear()}`)
            })
            .on("mouseleave", function () {
                tooltipDot.style("opacity", 0);
                tooltip.style("display", "none");
            });
    });
}

async function drawDisasterCountChange() {
    // Set the dimensions and margins of the graph
    var margin = 100;
    var width  = 800 - margin;
    var height = 600 - margin;
    
    //Read the data
    d3.csv("/data/Climate-related_Disasters_Frequency.csv", function(d) {
        if (d.Indicator == 'Climate related disasters frequency, Number of Disasters: TOTAL') {
            var array = []
            for (i = 1980; i < 2023; i++) {
                array.push({ country: d.Country, date : d3.timeParse("%Y")(i), value : d[`F${i}`] });
            }
            return array
        }
    })
    .then(function(dataset) {
        var processedDataset = [];
        var allGroup = [];
        const allCountries = new Map();
        const worldData = new Map();
        dataset.forEach(function(d) {
            d.forEach(function (x) {
                keyDate = x.date.getFullYear()
                processedDataset.push({"country": x.country, "date": x.date, "value":x.value})
                var v = 0;
                if (worldData.has(keyDate)) {
                    v = worldData.get(keyDate);
                }
                worldData.set(keyDate, v + +x.value)
                if (allCountries.has(x.country) == false) {
                    allCountries.set(x.country, 1);
                    allGroup.push(x.country)
                }
                
            });
        });
        allGroup.push("World");
        worldData.forEach(function(value, key, map) {
            processedDataset.push({"country": "World", "date": d3.timeParse("%Y")(key), "value": value.toString() })
        });

        // add the options to the button
        d3.select("#selectButton")
          .selectAll('myOptions')
          .data(allGroup)
          .enter()
          .append('option')
          .text(function (d) { return d; })
          .attr("value", function (d) { return d; })

        function update(selectedOption) {
            d3.select("#disasterchart").select("svg").remove();

            // Append the svg object to the body of the page
            const svg = d3.select("#disasterchart")
            .append("svg")
            .attr("width", width + margin)
            .attr("height", height + margin)
            .append("g")
            .attr("transform", "translate(" + margin/2 + "," + margin/2 + ")");

            // Chart Title
            svg.append('text')
            .attr('x', width/2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .style('font-size', 24)
            .style('fill', "#0000FF")
            .text(`Frequency of Natural Disasters - ${selectedOption}`);

            var relevantDataset = []
            processedDataset.forEach(function(d) {
                if (d.country == selectedOption ) {
                    relevantDataset.push(d)
                }
            });
    
            // Accessors
            const xAccessor = d => d.date
            const yAccessor = d => d.value
    
            // Scales
            var xScale = d3.scaleBand()
                           .domain(relevantDataset.map(function(d) { return d.date.getFullYear(); }))
                           .range([ 0, width ])
                           .padding(0.2);
            var yScale = d3.scaleLinear()
                            .domain([d3.min(relevantDataset, function(d) { return +d.value; }), d3.max(relevantDataset, function(d) { return +d.value; })])
                            .range([ height, 0 ]);
    
            // X Axis label
            svg.append('text')
                .attr('x', width/2)
                .attr('y', height + 40)
                .attr('text-anchor', 'middle')
                .style('font-family', 'Helvetica')
                .style('font-size', 12)
                .style('stroke', "#FFFFFF")
                .style('fill', "#000000")
                .text('Year');
    
            // Y Axis label
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(-30,' + (height/2) + ')rotate(-90)')
                .style('font-family', 'Helvetica')
                .style('font-size', 14)
                .style('fill', "#000000")
                .text('Number of Natural Disasters');
            
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .style('fill', "#000000")
                .style('stroke', "#000000")
                .call(d3.axisBottom(xScale));
        
            // Add Y axis
            svg.append("g")
                .style('fill', "#000000")
                .style('stroke', "#000000")
                .call(d3.axisLeft(yScale));
        
            // Bar chart
            svg.append('g')
               .selectAll("mybar")
               .data(relevantDataset)
               .enter()
               .append("rect")
               .filter(function(d) { return d.country == selectedOption })
               .attr("x", function(d) { return xScale(d.date.getFullYear()); })
               .attr("y", function(d) { return yScale(d.value); })
               .attr("width", xScale.bandwidth())
               .attr("height", function(d) { return height - yScale(d.value); })
               .attr("fill", "#FB8C00");
    
            // Tooltip pointer circle
            const tooltipDot = svg.append("circle")
                                    .attr("r", 5)
                                    .attr("fill", "#fc8781")
                                    .attr("stroke", "black")
                                    .attr("stroke-width", 2)
                                    .style("opacity", 0)
                                    .style("pointer-events", "none");
            
            const tooltip = d3.select("#disastercharttooltip");
    
            svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("opacity", 0)
                .on("touchmouse mousemove", function (event) {
                    const mousePos = d3.pointer(event, this);
                    
                    var domain = xScale.domain();
                    var range = xScale.range();
                    var rangePoints = d3.range(range[0], range[1], xScale.step())
                    var date = domain[d3.bisect(rangePoints, mousePos[0]) - 1];
    
                    bisectionIndex = date % domain[0]
    
                    // math.max prevents negative index reference error
                    const hoveredIndexData = relevantDataset[Math.max(0, bisectionIndex - 1)];
    
                    // Update Image
                    tooltipDot.style("opacity", 0.75)
                              .attr("cx", xScale(date))
                              .attr("cy", yScale(yAccessor(hoveredIndexData)))
                              .raise();
    
                    tooltip.style("display", "block")
                           .style("top", `${yScale(yAccessor(hoveredIndexData)) + 50}px`)
                           .style("left", `${xScale(date) + 200}px`);
    
                    tooltip.select(".numberofdisasters").text(`Number of disasters: ${yAccessor(hoveredIndexData)}`);
                    tooltip.select(".year").text(`Year: ${xAccessor(hoveredIndexData).getFullYear()}`)
                    tooltip.select(".country").text(`Country: ${selectedOption}`)
                })
                .on("mouseleave", function () {
                    tooltipDot.style("opacity", 0);
                    tooltip.style("display", "none");
                });
        }

        update("World");

        // Select callback
        d3.select("#selectButton").on("change", function(d) {
            var selectedOption = d3.select(this).property("value")
            update(selectedOption)
        })
    });
}

