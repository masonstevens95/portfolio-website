import * as tf from "@tensorflow/tfjs";

export async function detectEdgesWithTF(
  imageData: ImageData,
  threshold: number = 100
): Promise<ImageData> {
  // 1. Run edge detection inside tidy, return final tensor
  const edgesTensor = tf.tidy(() => {
    const imgTensor = tf.browser.fromPixels(imageData, 1).toFloat(); // [h, w, 1]

    const sobelX = tf.tensor2d(
      [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
      ],
      [3, 3]
    );
    const sobelY = tf.tensor2d(
      [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
      ],
      [3, 3]
    );

    const sobelX4D = sobelX.reshape([3, 3, 1, 1]);
    const sobelY4D = sobelY.reshape([3, 3, 1, 1]);

    const img4D = imgTensor.expandDims(0); // [1,h,w,1]

    const gx = tf.conv2d(img4D, sobelX4D, 1, "same");
    const gy = tf.conv2d(img4D, sobelY4D, 1, "same");

    const mag = tf.sqrt(tf.add(tf.square(gx), tf.square(gy)));
    const edges = mag.greater(threshold).mul(255).toInt();

    return edges.squeeze(); // [h,w]
  });

  // 2. Now convert tensor → pixels outside tidy
  const pixels = await tf.browser.toPixels(edgesTensor);

  // 3. Cleanup
  edgesTensor.dispose();

  // 4. Wrap into ImageData
  return new ImageData(pixels, imageData.width, imageData.height);
}
