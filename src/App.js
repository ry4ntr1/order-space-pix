import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapboxExample = () => {
	const mapContainerRef = useRef(null);
	const mapRef = useRef(null);
	const [lng, setLng] = useState(-97.7431);
	const [lat, setLat] = useState(30.2672);
	const [zoom, setZoom] = useState(12);
	const [showModal, setShowModal] = useState(false);
	const [shareableURL, setShareableURL] = useState("");
	const [showToast, setShowToast] = useState(false);

	const getURLParams = () => {
		const params = new URLSearchParams(window.location.search);
		return {
			latParam: parseFloat(params.get("lat")),
			lngParam: parseFloat(params.get("lng")),
			zoomParam: parseFloat(params.get("zoom")),
		};
	};

	useEffect(() => {
		const { latParam, lngParam, zoomParam } = getURLParams();

		if (!mapRef.current) {
			const initialLng = lngParam || lng;
			const initialLat = latParam || lat;
			const initialZoom = zoomParam || zoom;

			setLng(initialLng);
			setLat(initialLat);
			setZoom(initialZoom);

			mapRef.current = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/streets-v11",
				center: [initialLng, initialLat],
				zoom: initialZoom,
			});

			mapRef.current.on("move", () => {
				setLng(mapRef.current.getCenter().lng.toFixed(4));
				setLat(mapRef.current.getCenter().lat.toFixed(4));
				setZoom(mapRef.current.getZoom().toFixed(2));
			});
		}
	}, [lng, lat, zoom]);

	const createShareableLink = () => {
		const currentLng = mapRef.current.getCenter().lng.toFixed(4);
		const currentLat = mapRef.current.getCenter().lat.toFixed(4);
		const currentZoom = mapRef.current.getZoom().toFixed(2);

		setShareableURL(
			`${window.location.origin}?lat=${currentLat}&lng=${currentLng}&zoom=${currentZoom}`
		);
		setShowModal(true);
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(shareableURL);
		setShowToast(true);
		setShowModal(false);
		setTimeout(() => setShowToast(false), 2000);
	};

	const handleModalClose = (e) => {
		if (e.target.id === "modalBackdrop") {
			setShowModal(false);
		}
	};

	return (
		<div className="relative w-full h-screen">
			<div ref={mapContainerRef} className="w-full h-full" />

			<div className="absolute top-4 left-4">
				<button
					className="text-[#412db5] border border-[#412db5] fas fa-link bg-white px-2 py-2 rounded shadow-lg"
					onClick={createShareableLink}
				></button>
			</div>

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

			{showToast && (
				<div className="fixed bottom-4 right-4 bg-[#412db5] text-white py-2 px-4 rounded-lg shadow-lg">
					Link copied to clipboard!
				</div>
			)}
		</div>
	);
};

export default MapboxExample;
