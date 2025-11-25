'use client';

import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { ShoppingBagIcon, TruckIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function NosotrosPage() {
    const values = [
        {
            icon: ShoppingBagIcon,
            title: 'Calidad Premium',
            description: 'Seleccionamos cuidadosamente cada producto para garantizar la mejor calidad.'
        },
        {
            icon: TruckIcon,
            title: 'Envío Rápido',
            description: 'Entrega en 24-48 horas en la mayoría de las ubicaciones.'
        },
        {
            icon: HeartIcon,
            title: 'Atención al Cliente',
            description: 'Nuestro equipo está disponible para ayudarte en todo momento.'
        },
        {
            icon: SparklesIcon,
            title: 'Tendencias Actuales',
            description: 'Siempre a la vanguardia de la moda con las últimas tendencias.'
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Sobre UpWear
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Tu destino para moda premium y estilo contemporáneo
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="prose prose-lg mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Historia</h2>
                    <p className="text-gray-600 mb-4">
                        UpWear nació con una visión clara: hacer que la moda de alta calidad sea accesible para todos.
                        Desde nuestros inicios, nos hemos comprometido a ofrecer productos que combinen estilo,
                        comodidad y durabilidad.
                    </p>
                    <p className="text-gray-600 mb-4">
                        Trabajamos directamente con diseñadores y fabricantes para traerte las últimas tendencias
                        sin comprometer la calidad. Cada pieza en nuestra colección es seleccionada cuidadosamente
                        para asegurar que cumpla con nuestros altos estándares.
                    </p>
                    <p className="text-gray-600">
                        Hoy, UpWear es más que una tienda de ropa. Somos una comunidad de personas que valoran
                        el estilo personal y la expresión individual a través de la moda.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Nuestros Valores
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-4">
                                    <value.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
                            <div className="text-gray-600">Clientes Felices</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                            <div className="text-gray-600">Productos</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
                            <div className="text-gray-600">Marcas</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
                            <div className="text-gray-600">Soporte</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-black text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        ¿Listo para actualizar tu estilo?
                    </h2>
                    <p className="text-gray-300 mb-8">
                        Explora nuestra colección y encuentra tu próxima pieza favorita
                    </p>
                    <a
                        href="/shop"
                        className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Explorar Tienda
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
