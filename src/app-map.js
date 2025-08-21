import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import locationPin from './components/pin.png';
import './app-map.css';

function Index1() {
  const [cep, setCep] = useState('');
  const [addressData, setAddressData] = useState({
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
    pais: 'Brasil',
    longitude: '',
    latitude: '',
  });

  const [isReadOnly, setIsReadOnly] = useState({
    logradouro: false, bairro: false, cidade: false,
    uf: false, pais: true, longitude: false, latitude: false,
  });

  const [mapPosition, setMapPosition] = useState({ lat: -23.55052, lng: -46.633308, });
  const [mapZoom, setMapZoom] = useState(11);
  const [showResults, setShowResults] = useState(false);

  const resetForm = () => {
    setCep('');
    setAddressData({
      logradouro: '', bairro: '', cidade: '',
      uf: '', pais: 'Brasil', longitude: '', latitude: '',
    });
    setIsReadOnly({
      logradouro: false, bairro: false, cidade: false,
      uf: false, pais: true, longitude: false, latitude: false,
    });
    setMapPosition({ lat: -23.55052, lng: -46.633308 });
    setMapZoom(11);
    setShowResults(false);
  };

  const getCoordinatesWithNominatim = async (address) => {
    try {
      const fullAddress = `${address.logradouro || ''}, ${address.bairro || ''}, ${address.localidade || ''}, ${address.uf || ''}, Brasil`;
      const encodedAddress = encodeURIComponent(fullAddress);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      }
    } catch (error) {
      console.error("Erro ao obter coordenadas com Nominatim:", error);
    }
    return null;
  };

  const handleCepSearch = async (e) => {
    e.preventDefault();
    if (!cep) return;
    const cepRegex = /^[0-9]{8}$/;
    if (!cepRegex.test(cep)) {
      alert("Formato de CEP inválido.");
      resetForm();
      return;
    }
    setAddressData({
      logradouro: '...', bairro: '...', cidade: '...',
      uf: '...', pais: '...', longitude: '...', latitude: '...',
    });
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        alert("CEP não encontrado.");
        resetForm();
        return;
      }
      const coordinates = await getCoordinatesWithNominatim(data);
      setAddressData({
        logradouro: data.logradouro || '', bairro: data.bairro || '',
        cidade: data.localidade || '', uf: data.uf || '',
        pais: 'Brasil', longitude: coordinates ? coordinates.longitude.toString() : '',
        latitude: coordinates ? coordinates.latitude.toString() : '',
      });
      setIsReadOnly({
        logradouro: !!data.logradouro, bairro: !!data.bairro,
        cidade: !!data.localidade, uf: !!data.uf,
        pais: true, longitude: !!coordinates, latitude: !!coordinates,
      });
      if (coordinates) {
        setMapPosition({ lat: coordinates.latitude, lng: coordinates.longitude });
        setMapZoom(13);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    } catch (err) {
      console.error("Erro na consulta:", err);
      alert("Erro ao consultar CEP.");
      resetForm();
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prevData => ({ ...prevData, [name]: value }));
  };

  const customPinIcon = new L.Icon({
    iconUrl: locationPin,
    iconRetinaUrl: locationPin,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  return (
    <div className="app-container">
      {/* Container principal que agrupa todo o formulário */}
      <div className="form-card">
        <Form onSubmit={handleCepSearch}>
          <Form.Group style={{ marginBottom: '10px' }}>
            <Form.Label>CEP:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite um CEP válido"
              value={cep}
              onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Pesquisar
          </Button>
        </Form>
        
        {/* Renderização condicional dos campos de endereço abaixo do botão */}
        {showResults && (
          <>
            <hr style={{ margin: '20px 0' }} /> {/* Linha divisória para separar */}
            <Form>
              <Form.Group style={{ marginBottom: '10px' }}>
                <Form.Label>Endereço:</Form.Label>
                <Form.Control type="text" name="logradouro" value={addressData.logradouro} readOnly={isReadOnly.logradouro} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group style={{ marginBottom: '10px' }}>
                <Form.Label>Bairro:</Form.Label>
                <Form.Control type="text" name="bairro" value={addressData.bairro} readOnly={isReadOnly.bairro} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group style={{ marginBottom: '10px' }}>
                <Form.Label>Cidade:</Form.Label>
                <Form.Control type="text" name="cidade" value={addressData.cidade} readOnly={isReadOnly.cidade} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group style={{ marginBottom: '10px' }}>
                <Form.Label>UF:</Form.Label>
                <Form.Control type="text" name="uf" value={addressData.uf} readOnly={isReadOnly.uf} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group style={{ marginBottom: '10px' }}>
                <Form.Label>Latitude:</Form.Label>
                <Form.Control type="text" name="latitude" value={addressData.latitude} readOnly={isReadOnly.latitude} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group style={{ marginBottom: '10px' }}>
                <Form.Label>Longitude:</Form.Label>
                <Form.Control type="text" name="longitude" value={addressData.longitude} readOnly={isReadOnly.longitude} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group style={{ marginBottom: '10px' }}>
                <Form.Label>País:</Form.Label>
                <Form.Control type="text" value={addressData.pais} readOnly={true} />
              </Form.Group>
            </Form>
          </>
        )}
      </div>

      {/* Renderização condicional do mapa */}
      {showResults && (
        <div className="map-card">
          <MapContainer
            key={`${mapPosition.lat}-${mapPosition.lng}`}
            center={mapPosition}
            zoom={mapZoom}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {addressData.latitude && addressData.longitude &&
             !isNaN(parseFloat(addressData.latitude)) &&
             !isNaN(parseFloat(addressData.longitude)) && (
              <Marker
                position={[parseFloat(addressData.latitude), parseFloat(addressData.longitude)]}
                icon={customPinIcon}
              >
                <Popup>
                  {`${addressData.logradouro}, ${addressData.bairro}`}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default Index1;