package ctimsviewer;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import ctimsviewer.service.FilesStorageService;

import javax.annotation.Resource;

@SpringBootApplication()
public class CtimsViewerApplication implements CommandLineRunner {

	@Resource
	FilesStorageService storageService;

	public static void main(String[] args) {
		SpringApplication.run(CtimsViewerApplication.class, args);
	}

	@Override
	public void run(String... arg) {
		storageService.init();
	}
}
