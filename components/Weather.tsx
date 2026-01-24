
import React, { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

const WeatherWidget: React.FC<{ defaultCity: string }> = ({ defaultCity }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch from OpenWeatherMap
    // const apiKey = 'YOUR_API_KEY';
    // fetch(`https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&units=metric&appid=${apiKey}`)
    
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      const mockData: Record<string, WeatherData> = {
        'Paris': { temp: 18, condition: 'Parcialmente Nublado', icon: 'fa-cloud-sun' },
        'Londres': { temp: 14, condition: 'Chuvisco', icon: 'fa-cloud-rain' },
        'Roma': { temp: 24, condition: 'Céu Limpo', icon: 'fa-sun' },
        'Milão': { temp: 21, condition: 'Nublado', icon: 'fa-cloud' },
        'Veneza': { temp: 20, condition: 'Céu Limpo', icon: 'fa-sun' },
        'Bruxelas': { temp: 16, condition: 'Chuvisco', icon: 'fa-cloud-showers-heavy' },
      };
      setWeather(mockData[defaultCity] || mockData['Paris']);
      setLoading(false);
    }, 800);
  }, [defaultCity]);

  if (loading) return <div className="animate-pulse h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl px-4 py-2 flex items-center space-x-3">
      <div className="text-2xl text-blue-600">
        <i className={`fa-solid ${weather?.icon}`}></i>
      </div>
      <div>
        <div className="text-sm font-bold">{weather?.temp}°C</div>
        <div className="text-[10px] text-slate-500 uppercase font-black">{weather?.condition}</div>
      </div>
    </div>
  );
};

export default WeatherWidget;
