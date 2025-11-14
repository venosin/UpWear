'use client'

import { Button, Card, CardBody, CardHeader, Input } from '@heroui/react'

export function TestHeroUI() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Prueba de HeroUI Components</h1>

      <Card className="max-w-md">
        <CardHeader>
          <h3 className="text-lg font-semibold">Componentes HeroUI</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ingresa tu nombre"
            variant="bordered"
          />
          <div className="flex gap-2">
            <Button color="primary">
              Botón Primario
            </Button>
            <Button color="secondary" variant="bordered">
              Botón Secundario
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}