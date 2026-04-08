import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchMagasin } from "@/store/MagasinSlice";

const StoreInfo = () => {
  const dispatch = useAppDispatch();
  const { magasin } = useAppSelector((state) => state.magasin);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    dispatch(fetchMagasin());
  }, [dispatch]);

  useEffect(() => {
    if (!magasin?.store_lat || !magasin?.store_lng) return;

    const lat = parseFloat(magasin.store_lat);
    const lng = parseFloat(magasin.store_lng);

    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:hsl(22,100%,50%);border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${magasin.name}</b><br>${magasin.city}<br>${magasin.openingHours ?? ""}`)
        .openPopup();

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [magasin?.store_lat, magasin?.store_lng]);

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden border border-border" />
      <div className="bg-card rounded-lg p-4 border border-border space-y-1">
        <p className="font-heading font-bold text-sm text-foreground">
          {magasin?.name ?? "Jumeaux Sports Store"}
        </p>
        <p className="text-muted-foreground text-xs">
          {magasin?.adress ? `${magasin.adress}, ` : ""}{magasin?.city ?? "Tunis"}
        </p>
        {magasin?.openingHours && (
          <p className="text-muted-foreground text-xs">{magasin.openingHours}</p>
        )}
        {magasin?.phone && (
          <p className="text-muted-foreground text-xs">📞 {magasin.phone}</p>
        )}
        {magasin?.email && (
          <p className="text-muted-foreground text-xs">✉️ {magasin.email}</p>
        )}
      </div>
    </div>
  );
};

export default StoreInfo;