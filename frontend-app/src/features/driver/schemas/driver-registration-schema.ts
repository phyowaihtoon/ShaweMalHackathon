export type DriverRegistrationFormValues = {
  name: string
  companyName: string
  nrc: string
  nrcFrontPhotoPath: string
  nrcBackPhotoPath: string
  drivingLicensePhotoPath: string
  profilePhotoPath: string
  phone: string
  currentAddress: string
  vehicleTypeId: string
  vehicleLicensePlateNumber: string
  vehiclePhotoPath: string
  wheelTaxPhotoPath: string
}

export function validateDriverRegistrationForm(
  values: DriverRegistrationFormValues,
  t: (key: string) => string,
) {
  const errors: Partial<Record<keyof DriverRegistrationFormValues, string>> = {}

  const requiredKeys: Array<keyof DriverRegistrationFormValues> = [
    'name',
    'nrc',
    'nrcFrontPhotoPath',
    'nrcBackPhotoPath',
    'drivingLicensePhotoPath',
    'profilePhotoPath',
    'phone',
    'currentAddress',
    'vehicleTypeId',
    'vehicleLicensePlateNumber',
    'vehiclePhotoPath',
    'wheelTaxPhotoPath',
  ]

  for (const key of requiredKeys) {
    if (!String(values[key] ?? '').trim()) {
      errors[key] = t('auth.required')
    }
  }

  if (values.nrc.trim() && values.nrc.trim().length !== 15) {
    errors.nrc = t('driver.nrcLength')
  }

  return errors
}
