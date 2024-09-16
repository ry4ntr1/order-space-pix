import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const layer_metadata = {
	Coalhurst: { center: [49.7663487, -112.9621883], file: "Coalhurst.tif" },
	DiamondValley: {
		center: [50.690811, -114.3276151],
		file: "DiamondValley.tif",
	},
	JumpingPound: {
		center: [51.1447007, -114.5803002],
		file: "JumpingPound.tif",
	},
	Mossleigh: { center: [50.7213585, -113.3170537], file: "Mossleigh.tif" },
	Priddis: { center: [50.8971137, -114.2257905], file: "Priddis.tif" },
	SpyHill: { center: [51.1769612, -114.2115897], file: "SpyHill.tif" },
	WaterValley: { center: [51.53558, -114.6893865], file: "WaterValley.tif" },
	WeedLake: { center: [51.0116526, -113.6743955], file: "WeedLake.tif" },
};
const MapboxExample = () => {
	const mapContainerRef = useRef(null);
	const mapRef = useRef(null);
	const [lng, setLng] = useState(-97.7431);
	const [lat, setLat] = useState(30.2672);
	const [zoom, setZoom] = useState(12);
	const [showModal, setShowModal] = useState(false);
	const [shareableURL, setShareableURL] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [selectedDataset, setSelectedDataset] = useState("DiamondValley");
	const [showDatasetModal, setShowDatasetModal] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);

	// Get URL parameters for lat, lng, and zoom
	const getURLParams = () => {
		const params = new URLSearchParams(window.location.search);
		return {
			latParam: parseFloat(params.get("Lat")),
			lngParam: parseFloat(params.get("Lon")),
			zoomParam: parseFloat(params.get("Zoom")),
			datasetParam: params.get("Dataset"),
		};
	};

	// Initialize map
	useEffect(() => {
		const { latParam, lngParam, zoomParam, datasetParam } = getURLParams();

		const initialDataset = datasetParam || selectedDataset;

		const initialLng = lngParam || layer_metadata[initialDataset].center[1];
		const initialLat = latParam || layer_metadata[initialDataset].center[0];
		const initialZoom = zoomParam || zoom;

		setSelectedDataset(initialDataset); // Update selectedDataset if URL param is present
		setLng(initialLng);
		setLat(initialLat);
		setZoom(initialZoom);

		if (!mapRef.current) {
			// Create Mapbox map
			mapRef.current = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/standard-satellite",
				center: [initialLng, initialLat],
				zoom: initialZoom,
			});

			// Update map coordinates and zoom on move
			mapRef.current.on("move", () => {
				setLng(mapRef.current.getCenter().lng.toFixed(4));
				setLat(mapRef.current.getCenter().lat.toFixed(4));
				setZoom(mapRef.current.getZoom().toFixed(2));
			});

			// Set mapLoaded to true when the map has fully loaded
			mapRef.current.on("load", () => {
				setMapLoaded(true);
			});
		}
	}, []);

	// Update tile layer when selectedDataset changes and map is loaded
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return; // Map is not initialized or not loaded yet

		// Remove existing tile layer and source if they exist
		if (mapRef.current.getLayer("customTilesLayer")) {
			mapRef.current.removeLayer("customTilesLayer");
		}
		if (mapRef.current.getSource("customTiles")) {
			mapRef.current.removeSource("customTiles");
		}

		// Add raster tile layer for the selected dataset
		const tilesUrl = `/tiles/${selectedDataset}/{z}/{x}/{y}.png`;

		mapRef.current.addSource("customTiles", {
			type: "raster",
			tiles: [tilesUrl],
			tileSize: 256,
			minzoom: 15,
			maxzoom: 20,
		});

		mapRef.current.addLayer({
			id: "customTilesLayer",
			type: "raster",
			source: "customTiles",
		});
	}, [selectedDataset, mapLoaded]);

	// Create shareable link
	const createShareableLink = () => {
		const currentLng = mapRef.current.getCenter().lng.toFixed(4);
		const currentLat = mapRef.current.getCenter().lat.toFixed(4);
		const currentZoom = mapRef.current.getZoom().toFixed(2);

		const shareableLink = `${window.location.origin}?Dataset=${selectedDataset}&Lat=${currentLat}&Lon=${currentLng}&Zoom=${currentZoom}`;
		setShareableURL(shareableLink);
		setShowModal(true);
	};

	// Copy link to clipboard
	const copyToClipboard = () => {
		navigator.clipboard.writeText(shareableURL);
		setShowToast(true);
		setShowModal(false);
		setTimeout(() => setShowToast(false), 2000);
	};

	// Close modal on backdrop click
	const handleModalClose = (e) => {
		if (e.target.id === "modalBackdrop") {
			setShowModal(false);
		}
	};

	// Download dataset based on selected dataset
	const downloadDataset = () => {
		const datasetFile = layer_metadata[selectedDataset].file;
		const downloadUrl = `http://albedo-sim-data.s3-website-us-west-2.amazonaws.com/${datasetFile}`;
		window.location.assign(downloadUrl);
	};

	// Zoom to the selected dataset's center
	const zoomToDataset = (dataset) => {
		setSelectedDataset(dataset);
		const [lat, lng] = layer_metadata[dataset].center;

		// Mapbox GL expects the order: [lng, lat]
		const center = [lng, lat];

		mapRef.current.setCenter(center);
		mapRef.current.setZoom(15);
		setShowDatasetModal(false);
	};

	// Show dataset selection modal
	const showDatasetSelection = () => {
		setShowDatasetModal(true);
	};

	return (
		<div className="relative w-full h-screen">
			<div ref={mapContainerRef} className="w-full h-full" />

			{/* Action buttons */}
			<div className="absolute top-4 left-4 flex space-x-2">
				<button
					className="text-[#412db5] border border-[#412db5] fas fa-link bg-white px-2 py-2 rounded shadow-lg"
					onClick={createShareableLink}
				></button>

				<button
					className="text-[#412db5] border border-[#412db5] fas fa-list bg-white px-2 py-2 rounded shadow-lg"
					onClick={showDatasetSelection}
				></button>

				<button
					className="text-[#412db5] border border-[#412db5] fas fa-download bg-white px-2 py-2 rounded shadow-lg"
					onClick={downloadDataset}
				></button>
			</div>

			{/* Shareable Link Modal */}
			{showModal && (
				<div
					id="modalBackdrop"
					className="fixed inset-0 flex items-center justify-center z-50"
					onClick={handleModalClose}
				>
					<div className="fixed inset-0 bg-gray-600 bg-opacity-50"></div>

					<div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto z-10 relative">
						<button
							className="absolute top-0 left-1 text-gray-500 hover:text-gray-700 text-md"
							onClick={() => setShowModal(false)}
						>
							&times;
						</button>

						<h2 className="text-lg font-bold mb-4 mt-4">Shareable Link</h2>
						<div className="overflow-x-auto">
							<input
								type="text"
								readOnly
								value={shareableURL}
								className="w-full p-2 border border-gray-300 rounded-lg mb-2"
								style={{ whiteSpace: "nowrap", overflowX: "auto" }}
							/>
						</div>
						<button
							className="text-[#412db5] font-bold py-2 px-2"
							onClick={copyToClipboard}
						>
							Copy Link
						</button>
					</div>
				</div>
			)}

			{/* Dataset Selection Modal */}
			{showDatasetModal && (
				<div
					id="modalBackdrop"
					className="fixed inset-0 flex items-center justify-center z-50"
					onClick={() => setShowDatasetModal(false)}
				>
					<div className="fixed inset-0 bg-gray-600 bg-opacity-50"></div>

					<div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto z-10 relative">
						<button
							className="absolute top-0 left-1 text-gray-500 hover:text-gray-700 text-md"
							onClick={() => setShowDatasetModal(false)}
						>
							&times;
						</button>

						<h2 className="text-lg font-bold mb-4 mt-4">Select Dataset</h2>
						<ul className="list-group">
							{Object.keys(layer_metadata).map((dataset) => (
								<li key={dataset} className="mb-2">
									<button
										className="text-[#412db5] font-bold py-2 px-2 w-full text-left"
										onClick={() => zoomToDataset(dataset)}
									>
										{dataset.split(/(?=[A-Z])/).join(" ")}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{/* Toast for link copied */}
			{showToast && (
				<div className="fixed bottom-4 right-4 bg-[#412db5] text-white py-2 px-4 rounded-lg shadow-lg">
					Link copied to clipboard!
				</div>
			)}
		</div>
	);
};

export default MapboxExample;