package com.example.lib.base;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

@NoRepositoryBean
public interface BaseRepository<T, ID> extends CrudRepository<T, ID>, PagingAndSortingRepository<T,ID> {

}
