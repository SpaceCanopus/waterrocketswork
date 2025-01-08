// Constants
const P_ATMOSPHERE = 101325; // Atmospheric pressure in Pascals
const V_BOTTLE = 0.001; // Bottle volume in cubic meters
let V_WATER = 0.00025; // Water volume in cubic meters
const GAMMA = 1.4; // Adiabatic index for air

function simulate(P_psi) {
    const P_INITIAL = P_psi * 6894.76; // Convert PSI to Pascals
    const V_GAS_INITIAL = V_BOTTLE - V_WATER;
    const V_FINAL = V_BOTTLE;

    let pressures = [];
    let volumes = [];
    let areas = []; // Array to store area segments
    let totalArea = 0; // Initialize total area under the curve

    // Initial conditions
    let V_current = V_GAS_INITIAL;
    let P_previous = P_INITIAL; // Start with the initial pressure

    // Fixed small volume step size
    const dV = 0.000001;

    while (V_current < V_FINAL) {
        // Calculate pressure
        let P = P_INITIAL * Math.pow(V_GAS_INITIAL / V_current, GAMMA);

        // Stop if pressure drops below atmospheric
        if (P <= P_ATMOSPHERE) break;

        // Calculate the area for the current segment using the trapezoidal rule
        let area = ((P + P_previous) / 2) * dV;
        areas.push(area); // Store the segment area
        totalArea += area; // Accumulate the total area

        // Update gas volume
        V_current += dV;

        // Store values
        volumes.push(V_current);
        pressures.push(P);

        // Update the previous pressure
        P_previous = P;
    }

    return { volumes, pressures, totalArea };
}

// Plot pressure vs volume graph
function plotPressureVolumeGraph(data) {
    const { volumes, pressures, totalArea } = data;

    const graphLayout = {
        autosize: true,
        margin: { l: 50, r: 20, t: 30, b: 40 },
        xaxis: {
            title: "Volume of Air (ml)",
            range: [0, 1500],
            tickformat: ",",
        },
        yaxis: { title: "Pressure (Pa)", range: [0, 600000] },
        annotations: [
            {
                xref: "paper",
                yref: "paper",
                x: 0.95,
                y: 0.05,
                xanchor: "right",
                yanchor: "bottom",
                text: `Total Area: ${totalArea.toFixed(2)} J`,
                showarrow: false,
                font: {
                    size: 12,
                    color: "black",
                },
            },
        ],
    };

    Plotly.newPlot("pressure-graph", [
        {
            x: volumes.map(v => v * 1000000), // Convert m³ to ml
            y: pressures,
            mode: "lines",
            name: "Pressure",
        },
        {
            x: [...volumes.map(v => v * 1000000), volumes[volumes.length - 1] * 1000000, volumes[0] * 1000000],
            y: [...pressures, 0, 0],
            fill: "tozeroy",
            type: "scatter",
            mode: "none",
            fillcolor: "rgba(0, 0, 255, 0.2)",
            name: "Area Under Curve",
        },
    ], { ...graphLayout, title: "Pressure vs Volume of Air" });
}

// Initialize sliders and graph
const psiSlider = document.getElementById("psi-slider");
const psiValue = document.getElementById("psi-value");
const waterVolumeSlider = document.getElementById("v-slider");
const waterVolumeValue = document.getElementById("v-value");

psiSlider.addEventListener("input", () => {
    psiValue.textContent = psiSlider.value;
    const data = simulate(parseFloat(psiSlider.value));
    plotPressureVolumeGraph(data);
});

waterVolumeSlider.addEventListener("input", () => {
    waterVolumeValue.textContent = waterVolumeSlider.value;
    V_WATER = parseFloat(waterVolumeSlider.value) / 1000000; // Update water volume in m³
    const data = simulate(parseFloat(psiSlider.value));
    plotPressureVolumeGraph(data);
});

// Render initial pressure vs volume graph
plotPressureVolumeGraph(simulate(60));
