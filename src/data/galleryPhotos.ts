export interface GalleryPhoto {
  src: string
  alt: string
  width: number
  height: number
}

// Unedited JPEGs supplied for the gallery; these are not verified Evergreen project records.
const image = (name: string, alt: string, width: number, height: number): GalleryPhoto => ({
  src: `/images/gallery/${encodeURIComponent(name)}`,
  alt,
  width,
  height,
})

export const galleryPhotos: readonly GalleryPhoto[] = [
  image('solar-panel-canopy-wide-view.jpeg', 'Solar panel canopy with a location stamp', 1280, 960),
  image('rooftop-panel-framing.jpeg', 'Solar panel and framing materials on a rooftop', 1280, 960),
  image('solar-inverter-and-metering-01.jpeg', 'Solar inverter and electrical meters with a location stamp', 1280, 960),
  image('solar-panel-rows.jpeg', 'Rows of solar panels seen from a rooftop', 1280, 720),
  image('rooftop-solar-frame-assembly.jpeg', 'Solar mounting frame being assembled on a rooftop', 1280, 960),
  image('elevated-solar-panel-structure.jpeg', 'Raised solar panel structure viewed from the side', 1280, 576),
  image('solar-rooftop-and-inverter-collage.jpeg', 'Rooftop solar panels, a person and an inverter in a two-part photo', 1056, 1214),
  image('rooftop-array-with-person-02.jpeg', 'Person standing near rooftop solar panels in a location-stamped photo', 960, 1280),
  image('rooftop-solar-panels-sideways.jpeg', 'Solar panels and a person in a sideways location-stamped photo', 899, 1599),
  image('solar-inverter-and-metering-02.jpeg', 'Solar inverter and metering equipment with a location stamp', 1280, 960),
  image('rooftop-array-with-person-01.jpeg', 'Person beside a rooftop solar array in a location-stamped photo', 1280, 960),
  image('solar-array-with-person-evening.jpeg', 'Person standing near solar panels in an evening location-stamped photo', 4080, 3060),
  image('solar-inverter-and-metering-03.jpeg', 'Close view of a solar inverter and two meters with a location stamp', 4080, 3060),
  image('rooftop-solar-work-in-progress.jpeg', 'Rooftop solar electrical work in progress', 960, 1280),
]
