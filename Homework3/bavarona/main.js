const width = window.innerWidth;
const height = window.innerHeight;

//define measurements
let teamMargin = {top: 10, right: 250, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = height-500 - teamMargin.top - teamMargin.bottom;
let teamTop = height - teamHeight -100;
let teamLeft = teamMargin.left;

// plots
d3.csv("data/pokemon_alopez247.csv").then(rawData =>{
    console.log("rawData", rawData);


    //parses the number of pokemon per type
    const typeCounter = {};
    rawData.forEach(d=>{
        const type1 = d.Type_1;
        const type2 = d.Type_2;

        if (type1){
            typeCounter[type1] = (typeCounter[type1] || 0)+1;
        }
        if (type2){
            typeCounter[type2] =(typeCounter[type2] || 0)+1;
        }

    });

    const typeData = Object.entries(typeCounter).map(([type, count]) => ({type, count}));
    console.log("typeData", typeData);

    //parses the number of pokemon per generation
    const generationCount = {};
    rawData.forEach(d=>{
        const gen = d.Generation;

        if (gen){
            generationCount[gen] = (generationCount[gen] || 0)+1;
        }

    });
    const genData = Object.entries(generationCount).map(([generate, count1]) => ({generate, count1}));
    console.log("typeData", typeData);

    //Parse the averages for hp, attack, defense, speed
    const statsCount = {};

    rawData.forEach(d=>{
        const gen = d.Generation;

        if (!statsCount[gen]){
            statsCount[gen] = {
                count: 0, hp: 0, attack: 0, defense: 0, special_attack: 0, special_defense: 0, speed: 0
            };
        }
        statsCount[gen].count +=1
        statsCount[gen].hp += +d.HP;
        statsCount[gen].attack += +d.Attack;
        statsCount[gen].defense += +d.Defense;
        statsCount[gen].special_attack += +d.Sp_Atk;
        statsCount[gen].special_defense += +d.Sp_Def;
        statsCount[gen].speed += +d.Speed;
    });

    //combines the averages into a parallel data to be used for plot
    const parallelData = Object.entries(statsCount).map(([gen, stat])=>
    ({
        generation: gen, hp: stat.hp / stat.count,
        attack: stat.attack/stat.count, defense: stat.defense/stat.count,
        special_attack: stat.special_attack/stat.count, special_defense: stat.special_defense/stat.count,
        speed: stat.speed/stat.count
    }));

    console.log("parallelData", parallelData);

// Plot 1: Bar Graph (Added Brushing)

    const svg = d3.select("svg");

    //appends g to svg that has the measurements
    const g1 = svg.append("g")
        .attr("width", teamWidth + teamMargin.left + teamMargin.right) //sets width
        .attr("height", teamHeight + teamMargin.top + teamMargin.bottom) //sets height
        .attr("transform", `translate(${teamLeft}, ${teamTop})`); //moves the g in the svg

    //maps colors to types
    const colorTypes = {
        "Grass":"green","Poison":"purple",
        "Fire":"red", "Flying": "lightblue",
        "Water": "blue", "Bug": "lightgreen",
        "Normal": "gray", "Electric": "yellow",
        "Ground": "brown", "Fairy":"pink",
        "Fighting": "orange", "Psychic": "magenta",
        "Rock": "maroon", "Steel": "darkgrey",
        "Ice": "darkblue", "Ghost": "lavender",
        "Dragon": "gold", "Dark":"black" 
    };

    // X label
    g1.append("text")
        .attr("x", teamWidth / 2) //centers on x axis
        .attr("y", teamHeight + 60) // position under the x axis
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Pokemon Type");

    // Y label
    g1.append("text")
        .attr("x", -(teamHeight / 2)) //centers vertically
        .attr("y", -40) //postions to the left of the y axis
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)") //rotate the text
        .text("Number of Pokemon");

    //graph title
    g1.append("text")
        .attr("x", teamWidth / 2) //centers title
        .attr("y", -30) //moves the title above the graph
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Number of Pokemon Per Type");

    //instructions for interaction
    g1.append("text")
        .attr("x", teamWidth / 2) //centers the title
        .attr("y", 0) //moves the title above the graph
        .attr("font-size", "15px")
        .attr("opacity", 0.5)
        .attr("text-anchor", "middle")
        .text("Brush over bars for exact counts");

    //title over legend
    g1.append("text")
        .attr("x", teamWidth +90) //centers title
        .attr("y", -25) //moves the title above the graph
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Legend");

    // X ticks
    const x2 = d3.scaleBand() //scales the x axis
        .domain(typeData.map(d => d.type)) //sets the domain for all types
        .range([0, teamWidth]) //sets the range as the width
        .paddingInner(0.1) //spaces
        .paddingOuter(0.2); //spaces

    //creates the bottom axis
    const xAxisCall2 = d3.axisBottom(x2);

    //appends the x axis
    g1.append("g")
        .attr("transform", `translate(0, ${teamHeight})`) //moves the axis under the chart
        .call(xAxisCall2) //calls the axis creation
        .selectAll("text") 
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

    // Y ticks
    const y2 = d3.scaleLinear() //scales the y axis
        .domain([0, d3.max(typeData, d => d.count)]) //domain from 0 to the max of typeData
        .range([teamHeight, 0]) //sets range
        .nice(); //rounds domain

    //creates the left axis with 6 ticks
    const yAxisCall2 = d3.axisLeft(y2).ticks(6);

    //appends the y axis to the graph
    g1.append("g").call(yAxisCall2);

    // Create bars
    const bars = g1.selectAll("rect").data(typeData)
    .enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", d => x2(d.type))
    .attr("width", x2.bandwidth())
    .attr("height", d => teamHeight - y2(d.count))
    .attr("fill", d => colorTypes[d.type])
    .attr("opacity", 0.8)
    .attr("stroke", "none");

    // Function to show the label over the bars when brushed on
    function showBrushLabel(d, i) {
        const barX = x2(d.type) + x2.bandwidth() / 2; //measurements to place label
        const barY = y2(d.count) - 45; 
        
        //helps create an id for each bar type
        const labelId = `brush-label-${d.type.replace(/\s+/g, '-')}`;
        
        // Removes the existing label
        g1.select(`#${labelId}`).remove();
        
        //appends a new group to hold text in label
        const label = g1.append("g")
            .attr("id", labelId)
            .attr("class", "brush-label");
        
        // Adds a rectangle to hold the text
        const textBg = label.append("rect")
            .attr("x", barX - 35) //measurements to place label and modified for exact placement
            .attr("y", barY - 5)
            .attr("width", 70)
            .attr("height", 40)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("rx", 3)
            .attr("opacity", 0.9);
        
        //adds the pokemon text
        label.append("text")
            .attr("x", barX)
            .attr("y", barY + 8)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text("Pokemon");

        //adds the count text on a new line
        label.append("text")
            .attr("x", barX)
            .attr("y", barY + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text("Count: " + d.count);
    }

    // Function to highlight the bar
    function highlightBar(bar) {
    bar.attr("opacity", 1)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    }

    // Function to return bar back to normal
    function returnBar(bar) {
    bar.attr("opacity", 0.8)
        .attr("stroke", "none");
    }

    // Creates the brush
    const brush = d3.brushX()
        .extent([[0, 0], [teamWidth, teamHeight]])
        .on("brush", brushed)
        .on("end", brushed);

    // Add brush the brush to the graph
    const brushGroup = g1.append("g")
        .attr("class", "brush")
        .call(brush);

    //function to handle the brush event
    function brushed() {
    const selection = d3.event.selection;
    
    // removes the brush labels after unbrushed
    g1.selectAll(".brush-label").remove();
    
    //if the brush is removed return the bar back to normal/remove highlight
    if (!selection) {
        bars.each(function() {
        returnBar(d3.select(this));
        });
        return;
    } 
    
    //extracts the start and end values of brush
    const [x0, x1] = selection;
    
    // Checks if bar is brushed
    bars.each(function(d, i) {
        const bar = d3.select(this);
        const barX = x2(d.type);
        const barWidth = x2.bandwidth();
        
        // if the bar is brushed over
        const isSelected = barX < x1 && (barX + barWidth) > x0;
        
        //highlight bar
        if (isSelected) {
        highlightBar(bar);
        showBrushLabel(d, i);
        } else {
        returnBar(bar);
        }
    });
    }

    //creates the legend using the svg append
    const legend = svg.append("g")
        .attr("transform", `translate(${teamWidth + teamMargin.left + 20}, ${teamTop})`);

    //definitions/measurements
    const legendHeight = 22;
    const legendWidth = 100;
    const types = Object.keys(colorTypes);

    //creates the colored squares for the legend
    legend.selectAll("rect")
        .data(types)
        .enter().append("rect")
        .attr("x", (_, i)=> (i%2)*legendWidth) //divides boxes into two columns
        .attr("y", (_, i) => Math.floor(i/2)*legendHeight) // stacks rows
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorTypes[d]); //fills boxes with colors

    //appends the type names next to boxes
    legend.selectAll("text")
        .data(types)
        .enter().append("text")
        .attr("x", (d, i) => (i % 2) * legendWidth + 25) //moves text to right of boxes
        .attr("y", (_, i) => Math.floor(i / 2) * legendHeight + 14) //align with the boxes
        .attr("font-size", "14px")
        .attr("text-anchor", "start")
        .text(d => d);


//Plot 2 Pie Chart (Added selection just in case filtering doesnt also count as selection)

    const radius = 150;
        
    //appends the g for the chart
    const generatePie = svg.append("g")
        .attr("transform", `translate(200, 215)`); //positions the pie chart at this location

    //adds random colors per generation
    const pieColor = d3.scaleOrdinal()
        .domain(genData.map(d => d.generate))
        .range(d3.schemeCategory10); 
    //generates the pie chart
    const pie = d3.pie().value(d=>d.count1);

    //generates the arcs for the slices
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    //keep track of selected slice
    let selectedSlices = new Set(); 

    //creates a group per slice
    const slices = generatePie.selectAll(".arc")
        .data(pie(genData)) //gets the generation data for slices
        .enter()
        .append("g")
        .attr("class", "arc")
        
        //adds the click for the slices
        .on("click", function(d, i) {

            //if slice is selected remove from set
            if (selectedSlices.has(d.data.generate)) {
                selectedSlices.delete(d.data.generate);
            } else {

                // if slice is not selected add to the set
                selectedSlices.add(d.data.generate);
            }

            // Update slices and labels based on selection
            updatePieSelection();
        });

    //appends the path for slices
    slices.append("path")
        .attr("d", arc) //creates the arc path
        .attr("fill", d=>pieColor(d.data.generate)); //fills slices with colors
        
    //calculates the total to create the percentages
    const total = d3.sum(genData, d => d.count1);

    // adds the percentages to each slice
    slices.append("text")
        .attr("class", "pie-label")
        .attr("transform", d => `translate(${arc.centroid(d)})`) //places the label in the center
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("fill", "black")
        .attr("font-weight", "bold")
        .style("opacity", 0) // Hides the labels
        .text(d => {
            const percent = (d.data.count1 / total) * 100; //calculates percent
            return percent ?`${percent.toFixed(1)}%` : "";  //return the percentage
        });

    //function to update the slice appearance
    function updatePieSelection() {

        slices.select("path")
            //if slice gen is in set bolden the slice outline
            .attr("stroke-width", d => {
                const isSelected = selectedSlices.has(d.data.generate);
                return isSelected ? 4 : 2;
            })
            //if the slice gen is in the set set black outline to black but boldened from previous check
            .attr("stroke", d => {
                
                const isSelected = selectedSlices.has(d.data.generate);
                return isSelected ? "black" : "black";
            }); 
        
        //if slice gen is in set reveal the percentage
        slices.select(".pie-label")
            .style("opacity", d => {
                const isSelected = selectedSlices.has(d.data.generate);
                return isSelected ? 1 : 0;
            });
    }

    //adds the title to the top of chart
    generatePie.append("text")
        .attr("x", 0) //centers
        .attr("y", -190) //places above the pie chart
        .attr("font-size", "21px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Number of Pokemon Per Generation"); 

    //adds the info for interactivity under title
    generatePie.append("text")
        .attr("x", 0) //centers
        .attr("y", -170) //places above the pie chart
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("opacity", 0.5)
        .text("Click on slices for more information");

    //adds the legend title
    generatePie.append("text")
        .attr("x", 230) //centers
        .attr("y", -140) //places above the pie chart
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Legend");

    //creates the g for the pie chart
    const pieLegend = svg.append("g")
        .attr("transform", "translate(400, 100)"); //positions it at this location

    const pieLegendHeight = 20;

    //creates boxes with colors for legend
    pieLegend.selectAll("rect")
        .data(genData) //gets genData
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (_, i) => i * pieLegendHeight) //stacks boxes vertically
        .attr("width", 15) //defines width
        .attr("height", 15) //defines height
        .attr("fill", d => pieColor(d.generate)); //fills the color
            
    // moves text next to each box for legend
    pieLegend.selectAll("text")
        .data(genData)
        .enter()
        .append("text")
        .attr("x", 25) //offsets text
        .attr("y", (_, i) => i * pieLegendHeight + 12) //moves text next to boxes
        .attr("font-size", "14px")
        .text(d => `Gen ${d.generate}`);   //generates the labels and applies them

    // Initial update to set the correct state
    updatePieSelection();

// Plot 3: Parallel Coordinates Plot (Added Selection and Filtering)

    //variables/definitions
    const variables = ["hp", "attack", "defense", "special_attack", "special_defense", "speed"];
    const pMargin = {top: 40, right: 40, bottom: 10, left: 40};
    const pWidth = 600 - pMargin.left - pMargin.right;
    const pHeight = 300 - pMargin.top - pMargin.bottom;

    //converts generation data from string to number to fix issues with parsing data
    parallelData.forEach(d => {
        d.generation = +d.generation;
    }); 

    //assigns colors to the generations
    const parColor = d3.scaleOrdinal()
        .domain(parallelData.map(d => d.generation))
        .range(d3.schemeCategory10);

    //creates a y scale for each variable
    const yScale = {};
    variables.forEach(v => {
        yScale[v] = d3.scaleLinear()
            .domain([
                d3.min(parallelData, d=> d[v]),
                d3.max(parallelData, d=> d[v])
            ])
            .range([pHeight, 0]);
    });

    //creates the x scale
    const xScale = d3.scalePoint()
        .domain(variables)
        .range([0, pWidth]);

    //generates the lines based on the variables and the values
    const genLines = d3.line()
        .x(d=> xScale(d.variable))
        .y(d=> yScale[d.variable](d.value));

    //appends g to parallelgroup
    const parallelGroup = svg.append("g")
        .attr("transform", "translate(800, 80)");

    //generates the lines for each generation
    const allPaths = parallelGroup.selectAll(".pokemon-path")
        .data(parallelData)
        .enter()
        .append("path")
        .attr("class", "pokemon-path")
        .attr("fill", "none")
        .attr("stroke", d => parColor(d.generation))
        .attr("stroke-width", 2)
        .attr("d", d => {
            const point = variables.map(v => ({
                variable: v, value: d[v]
            }));
            return genLines(point);
        });

    //creates an empty array to hold selected gens
    let selectedGenerations = []; 

    //function to update the filtered lines
    function updateFilteredLines() {
        allPaths.attr("stroke-opacity", d => {
            // If no gens are selected show all of the lines
            if (selectedGenerations.length === 0) {
                return 1;
            } else {
                //check if the current line is in the selected gen array
                return selectedGenerations.includes(d.generation) ? 1 : 0.1;
            }
        });
    }

    //creates the aces for each variable with label
    variables.forEach(v => {
        parallelGroup.append("g")
            .attr("transform", `translate(${xScale(v)}, 0)`)
            .call(d3.axisLeft(yScale[v]))
            .append("text")
            .attr("y", -10)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", "12px")
            .text(v);
    });

    //more definitons for updated legend with filter capability
    const rectSize = 15;
    const legendRowHeight = 25;
    
    //append g to parLegend and center according to measurements
    const parLegend = svg.append("g")
        .attr("transform", `translate(${pWidth + 850}, ${80})`);

    //creates array for unique generations
    const uniqueGenerations = Array.from(new Set(parallelData.map(d => d.generation))).sort(d3.ascending);

    //selects for legend items
    const legendItems = parLegend.selectAll(".legend-item")
        .data(uniqueGenerations)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * legendRowHeight})`)
        .style("cursor", "pointer")
        //when clicked
        .on("click", function(event, d_clicked) {
            
            //clicked + 1 to account for issue with clicking
            const actualGenerationClicked = d_clicked + 1;

            // check if the clicked gen is in the array
            const index = selectedGenerations.indexOf(actualGenerationClicked);

            if (index > -1) {
                // if its already selected remove it 
                selectedGenerations.splice(index, 1);
            } else {
                // If not selected, add it 
                selectedGenerations.push(actualGenerationClicked);
            }

            //to update the filter lines
            updateFilteredLines();

            // Updates the highlights based on selected generations
            parLegend.selectAll(".legend-item rect")
                    .attr("stroke", g => selectedGenerations.includes(g) ? "black" : "none")
                    .attr("stroke-width", g => selectedGenerations.includes(g) ? 2 : 0);
        });

    //appends rectangle and text for generations
    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", rectSize)
        .attr("height", rectSize)
        .attr("fill", d => parColor(d));
    legendItems.append("text")
        .attr("x", rectSize + 8)
        .attr("y", rectSize / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-size", "14px")
        .text(d => `Gen ${d}`);

    //defines the reset button and positions it 
    const resetButtonY = uniqueGenerations.length * legendRowHeight + 15;

    //creates the box for reset 
    parLegend.append("rect")
        .attr("x", 0) 
        .attr("y", resetButtonY)
        .attr("width", 100) 
        .attr("height", 25) 
        .attr("fill", "lightgray") 
        .style("cursor", "pointer") //to make cursor into a pointer when it hovers
        .on("click", resetSelection); //on click reset

    //adds text to the reset button
    parLegend.append("text")
        .attr("x", 50) 
        .attr("y", resetButtonY + 12.5) 
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .style("cursor", "pointer")
        .text("Reset Filters")
        .on("click", resetSelection); // on click reset

    // Function to reset the selection
    function resetSelection() {
        selectedGenerations = []; // Clears the array
        updateFilteredLines(); // updates the filters on the lines
        parLegend.selectAll(".legend-item rect")
                .attr("stroke", "none")
                .attr("stroke-width", 0);
    }

    //adds title to graph
    parallelGroup.append("text")
        .attr("x", pWidth / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Average Pokemon Stats per Generation");

    //adds title to filter boxes
    parallelGroup.append("text")
        .attr("x", pWidth + 100) //centers title
        .attr("y", -25) //moves the title above the graph
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Generation Filters");

    //adds instructions for interaction/animation
    parallelGroup.append("text")
        .attr("x", pWidth /2) //centers title
        .attr("y", -30) //moves the title above the graph
        .attr("font-size", "15px")
        .attr("opacity", 0.5)
        .attr("text-anchor", "middle")
        .text("Select Filters on the Right");

    // Initial call to update
    updateFilteredLines();
    
//catches any errors and gives an error message      
}).catch(function (error){
    console.log(error);
});