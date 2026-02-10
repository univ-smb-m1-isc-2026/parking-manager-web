import { Plus, MapPin } from 'lucide-react';

export function ParkingsTab({ parkings }: { parkings: any[] }) {
  return (
    <div>
      <div className="flex justify-end mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
          <Plus size={18} /> Ajouter un parking
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parkings.map(parking => (
          <div key={parking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            {/* ... Le contenu de ta carte parking ... */}
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{parking.name}</h3>
                    <a href={parking.mapsLink} target="_blank" className="text-blue-500 hover:underline text-sm flex items-center gap-1">
                    <MapPin size={14} /> Maps
                    </a>
                </div>
                <p className="text-gray-500 text-sm mb-4">{parking.desc}</p>
                <div className="bg-gray-50 p-3 rounded-lg mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Place Permanente</span>
                        <p className="font-bold text-gray-800">{parking.pricing.annual} € / an</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Place Temporaire</span>
                        <p className="font-bold text-gray-800">{parking.pricing.daily} € / jour</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Occupation :</div>
                    <div className="text-sm text-gray-600">{parking.occupied} / {parking.totalSpots} places</div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Gérer les places</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}