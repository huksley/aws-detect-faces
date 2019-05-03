/**
 * Define types for rekognition result
 */

import * as t from 'io-ts'

export const IOFeature = t.partial({
  Value: t.boolean,
  Confidence: t.number,
})

export const IOGender = t.partial({
  Value: t.union([t.literal('Female'), t.literal('Male'), t.string]),
  Confidence: t.number,
})

export const IOEmotion = t.partial({
  Value: t.union([
    t.literal('HAPPY'),
    t.literal('SAD'),
    t.literal('ANGRY'),
    t.literal('CONFUSED'),
    t.literal('DISGUSTED'),
    t.literal('SURPRISED'),
    t.literal('CALM'),
    t.literal('UNKNOWN'),
    t.string,
  ]),
  Confidence: t.number,
})

export const IOFaceFeature = t.partial({
  Type: t.union([
    t.literal('eyeLeft'),
    t.literal('eyeRight'),
    t.literal('nose'),
    t.literal('mouthLeft'),
    t.literal('mouthRight'),
    t.literal('leftEyeBrowLeft'),
    t.literal('leftEyeBrowRight'),
    t.literal('leftEyeBrowUp'),
    t.literal('rightEyeBrowLeft'),
    t.literal('rightEyeBrowRight'),
    t.literal('rightEyeBrowUp'),
    t.literal('leftEyeLeft'),
    t.literal('leftEyeRight'),
    t.literal('leftEyeUp'),
    t.literal('leftEyeDown'),
    t.literal('rightEyeLeft'),
    t.literal('rightEyeRight'),
    t.literal('rightEyeUp'),
    t.literal('rightEyeDown'),
    t.literal('noseLeft'),
    t.literal('noseRight'),
    t.literal('mouthUp'),
    t.literal('mouthDown'),
    t.literal('leftPupil'),
    t.literal('rightPupil'),
    t.literal('upperJawlineLeft'),
    t.literal('midJawlineLeft'),
    t.literal('chinBottom'),
    t.literal('midJawlineRight'),
    t.literal('upperJawlineRight'),
    t.string,
  ]),
  X: t.number,
  Y: t.number,
})

export const IORect = t.partial({
  Width: t.number,
  Height: t.number,
  Left: t.number,
  Top: t.number,
})

export const IOPose = t.partial({
  Roll: t.number,
  Yaw: t.number,
  Pitch: t.number,
})

export const IOImageQuality = t.partial({
  Brightness: t.number,
  Sharpness: t.number,
})

/**
 * Matches to AWS rekognition.detectFaces()
 */
export const IODetectFacesResult = t.partial({
  FaceDetails: t.array(
    t.partial({
      /**
       * Bounding box of the face. Default attribute.
       */
      BoundingBox: IORect,

      /**
       * The estimated age range, in years, for the face. Low represents the lowest estimated age and High represents the highest estimated age.
       */
      AgeRange: t.partial({ Low: t.number, High: t.number }),

      /**
       * Indicates whether or not the face is smiling, and the confidence level in the determination.
       */
      Smile: IOFeature,

      /**
       * Indicates whether or not the face is wearing eye glasses, and the confidence level in the determination.
       */
      Eyeglasses: IOFeature,

      /**
       * Indicates whether or not the face is wearing sunglasses, and the confidence level in the determination.
       */
      Sunglasses: IOFeature,

      /**
       * Gender of the face and the confidence level in the determination.
       */
      Gender: IOGender,

      /**
       * Indicates whether or not the face has a beard, and the confidence level in the determination.
       */
      Beard: IOFeature,

      /**
       * Indicates whether or not the face has a mustache, and the confidence level in the determination.
       */
      Mustache: IOFeature,

      /**
       * Indicates whether or not the eyes on the face are open, and the confidence level in the determination.
       */
      EyesOpen: IOFeature,

      /**
       * Indicates whether or not the mouth on the face is open, and the confidence level in the determination.
       */
      MouthOpen: IOFeature,

      /**
       * The emotions detected on the face, and the confidence level in the determination. For example, HAPPY, SAD, and ANGRY.
       */
      Emotions: t.array(IOEmotion),

      /**
       * Indicates the location of landmarks on the face. Default attribute.
       */
      Landmarks: t.array(IOFaceFeature),

      /**
       * Indicates the pose of the face as determined by its pitch, roll, and yaw. Default attribute.
       */
      Pose: IOPose,

      /**
       * Identifies image brightness and sharpness. Default attribute.
       */
      Quality: IOImageQuality,

      /**
       * Confidence level that the bounding box contains a face (and not a different object such as a tree). Default attribute.
       */
      Confidence: t.number,
    }),
  ),
})

export type DetectFacesResult = t.TypeOf<typeof IODetectFacesResult>
