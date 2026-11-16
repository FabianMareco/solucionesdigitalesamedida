/** @type {import('next').NextConfig} */
const nextConfig = {
  // El sitio se sirve tal cual desde /public (los archivos originales del borrador, sin modificar).
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/servicios', destination: '/servicios.html' },
      ],
    };
  },
};

export default nextConfig;
