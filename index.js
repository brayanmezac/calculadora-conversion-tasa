const express = require('express');
const bodyParser = require('body-parser');

class InterestRateCalculator {
  // Método principal para calcular tasas de interés
  calculateInterestRates(rates) {
    const periodosAlAno = {
      diario: 360,
      mensualVencido: 12,
      bimestralVencido: 6,
      trimestralVencido: 4,
      semestralVencido: 2,
      anualVencido: 1
    };

    // Validar entrada
    Object.keys(rates).forEach(periodo => {
      if (isNaN(rates[periodo])) {
        throw new Error(`La tasa para ${periodo} debe ser un número válido`);
      }
    });

    // Calcular tasas basándose en el período modificado
    const tasasCalculadas = {};
    
    // Determinar el período base para el cálculo
    const periodoBase = Object.keys(rates)[0];
    const valorBase = rates[periodoBase] / 100;

    // Calcular TEA
    const tasaEA = this.calcularTasaEfectivaAnual(valorBase, periodosAlAno[periodoBase]);

    // Calcular todas las tasas basadas en la TEA
    Object.entries(periodosAlAno).forEach(([periodo, periodos]) => {
      tasasCalculadas[periodo] = this.calcularTasaPeriodo(tasaEA, periodos) * 100;
    });

    return {
      tasas: tasasCalculadas,
      tasaEA: tasaEA * 100
    };
  }

  // Método para calcular la Tasa Efectiva Anual a partir de una tasa de período
  calcularTasaEfectivaAnual(tasaPeriodo, periodosAlAno) {
    return Math.pow((1 + tasaPeriodo), periodosAlAno) - 1;
  }

  // Método para calcular tasa para un período específico
  calcularTasaPeriodo(tasaEA, periodosAlAno) {
    return Math.pow((1 + tasaEA), (1 / periodosAlAno)) - 1;
  }
}

// Configuración de Express
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Instancia del calculador
const calculator = new InterestRateCalculator();
app.get('/', (req, res) => {
    res.send('Bienvenido a la calculadora de conversión de tasa');
  });

// Ruta para calcular tasas de interés
app.post('/calcular-tasas', (req, res) => {
  try {
    const { rates } = req.body;
    
    // Validar que se proporcionaron tasas
    if (!rates || Object.keys(rates).length === 0) {
      return res.status(400).json({ 
        error: 'Debe proporcionar al menos una tasa de interés' 
      });
    }

    // Calcular tasas
    const resultado = calculator.calculateInterestRates(rates);

    // Formatear resultados para mostrar 4 decimales
    const tasasFormateadas = Object.entries(resultado.tasas).reduce((acc, [key, value]) => {
      acc[key] = Number(value.toFixed(4));
      return acc;
    }, {});

    res.json({
      tasas: tasasFormateadas,
      tasaEA: Number(resultado.tasaEA.toFixed(4))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Crear servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});